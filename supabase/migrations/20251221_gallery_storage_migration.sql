-- Gallery Storage Migration
-- Purpose: Migrate gallery system to use Supabase Storage with "wildout-images/moments" bucket
-- Includes: Enhanced schema, storage policies, and data consistency mechanisms

-- 1. Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection)
VALUES (
    'wildout-images',
    'wildout-images',
    true,
    20971520, -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    true
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    avif_autodetection = true;

-- 2. Update gallery_items table to support storage integration
ALTER TABLE public.gallery_items
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS file_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS upload_session_id UUID,
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'ready' CHECK (processing_status IN ('pending', 'processing', 'ready', 'failed', 'deleted'));

-- Add index for storage path lookup
CREATE INDEX IF NOT EXISTS idx_gallery_items_storage_path ON public.gallery_items(storage_path);
CREATE INDEX IF NOT EXISTS idx_gallery_items_processing_status ON public.gallery_items(processing_status);

-- 3. Create audit log table for storage operations
CREATE TABLE IF NOT EXISTS public.storage_audit_log (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL CHECK (action IN ('upload', 'download', 'delete', 'update', 'list', 'copy', 'move')),
    bucket_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    metadata JSONB,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for storage audit log
ALTER TABLE public.storage_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own storage audit logs"
ON public.storage_audit_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert storage audit logs"
ON public.storage_audit_log FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 4. Create storage operation logging function
CREATE OR REPLACE FUNCTION public.log_storage_operation(
    p_action TEXT,
    p_bucket_name TEXT,
    p_file_path TEXT,
    p_file_size BIGINT DEFAULT NULL,
    p_mime_type TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
    v_user_id UUID := auth.uid();
    v_session_id TEXT;
BEGIN
    -- Get session ID from current context if available
    BEGIN
        v_session_id := current_setting('app.session_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_session_id := NULL;
    END;

    INSERT INTO public.storage_audit_log (
        user_id, action, bucket_name, file_path, file_size,
        mime_type, metadata, success, error_message,
        ip_address, user_agent, session_id
    ) VALUES (
        v_user_id, p_action, p_bucket_name, p_file_path, p_file_size,
        p_mime_type, p_metadata, p_success, p_error_message,
        inet_client_addr(), current_setting('app.user_agent', true), v_session_id
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- 5. Create gallery storage management functions
CREATE OR REPLACE FUNCTION public.create_gallery_item_with_storage(
    p_title TEXT,
    p_description TEXT,
    p_category TEXT,
    p_event_id UUID,
    p_partner_id UUID,
    p_tags TEXT[],
    p_storage_path TEXT,
    p_file_metadata JSONB
)
RETURNS SETOF public.gallery_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item_id UUID;
    v_new_item public.gallery_items;
BEGIN
    -- Validate category
    IF p_category NOT IN ('event', 'partner', 'team', 'general') THEN
        RAISE EXCEPTION 'Invalid category: %', p_category;
    END IF;

    -- Insert gallery item with storage path
    INSERT INTO public.gallery_items (
        title, description, category, event_id, partner_id, tags,
        image_url, storage_path, file_metadata, status, processing_status
    ) VALUES (
        p_title, p_description, p_category, p_event_id, p_partner_id, p_tags,
        '', p_storage_path, p_file_metadata, 'published', 'ready'
    ) RETURNING * INTO v_new_item;

    -- Log the operation
    PERFORM public.log_storage_operation(
        'upload',
        'wildout-images',
        p_storage_path,
        (p_file_metadata->>'size')::BIGINT,
        (p_file_metadata->>'mime_type'),
        p_file_metadata,
        true
    );

    RETURN NEXT v_new_item;
END;
$$;

-- 6. Function to update gallery item storage
CREATE OR REPLACE FUNCTION public.update_gallery_item_storage(
    p_item_id UUID,
    p_new_storage_path TEXT,
    p_old_storage_path TEXT DEFAULT NULL,
    p_file_metadata JSONB DEFAULT NULL
)
RETURNS SETOF public.gallery_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_item public.gallery_items;
BEGIN
    -- Update the gallery item
    UPDATE public.gallery_items
    SET
        storage_path = COALESCE(p_new_storage_path, storage_path),
        file_metadata = COALESCE(p_file_metadata, file_metadata),
        updated_at = NOW()
    WHERE id = p_item_id
    RETURNING * INTO v_updated_item;

    -- Log the update operation
    PERFORM public.log_storage_operation(
        'update',
        'wildout-images',
        COALESCE(p_new_storage_path, p_old_storage_path),
        (p_file_metadata->>'size')::BIGINT,
        (p_file_metadata->>'mime_type'),
        p_file_metadata,
        true
    );

    -- If old path exists and is different, log cleanup
    IF p_old_storage_path IS NOT NULL AND p_old_storage_path != p_new_storage_path THEN
        PERFORM public.log_storage_operation(
            'delete',
            'wildout-images',
            p_old_storage_path,
            NULL,
            NULL,
            NULL,
            true
        );
    END IF;

    RETURN NEXT v_updated_item;
END;
$$;

-- 7. Function to delete gallery item with storage cleanup
CREATE OR REPLACE FUNCTION public.delete_gallery_item_with_storage(
    p_item_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_storage_path TEXT;
    v_success BOOLEAN := true;
BEGIN
    -- Get storage path before deletion
    SELECT storage_path INTO v_storage_path
    FROM public.gallery_items
    WHERE id = p_item_id;

    -- Delete the gallery item
    DELETE FROM public.gallery_items WHERE id = p_item_id;

    -- Log the deletion (actual file cleanup happens in backend)
    IF v_storage_path IS NOT NULL THEN
        PERFORM public.log_storage_operation(
            'delete',
            'wildout-images',
            v_storage_path,
            NULL,
            NULL,
            NULL,
            true
        );
    END IF;

    RETURN v_success;
EXCEPTION
    WHEN OTHERS THEN
        -- Log failure
        IF v_storage_path IS NOT NULL THEN
            PERFORM public.log_storage_operation(
                'delete',
                'wildout-images',
                v_storage_path,
                NULL,
                NULL,
                NULL,
                false,
                SQLERRM
            );
        END IF;
        RETURN false;
END;
$$;

-- 8. Function to get paginated gallery items with storage info
CREATE OR REPLACE FUNCTION public.get_gallery_items_paginated(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_category TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'published',
    p_search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    image_url TEXT,
    thumbnail_url TEXT,
    category TEXT,
    status TEXT,
    tags TEXT[],
    display_order INTEGER,
    event_id UUID,
    partner_id UUID,
    storage_path TEXT,
    file_metadata JSONB,
    processing_status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH filtered_items AS (
        SELECT
            gi.*,
            COUNT(*) OVER() as total_count
        FROM public.gallery_items gi
        WHERE
            (p_category IS NULL OR gi.category = p_category) AND
            (p_status IS NULL OR gi.status = p_status) AND
            (p_search_query IS NULL OR
             gi.title ILIKE '%' || p_search_query || '%' OR
             gi.description ILIKE '%' || p_search_query || '%' OR
             gi.category ILIKE '%' || p_search_query || '%')
    )
    SELECT
        fi.id,
        fi.title,
        fi.description,
        fi.image_url,
        fi.thumbnail_url,
        fi.category,
        fi.status,
        fi.tags,
        fi.display_order,
        fi.event_id,
        fi.partner_id,
        fi.storage_path,
        fi.file_metadata,
        fi.processing_status,
        fi.created_at,
        fi.updated_at,
        fi.total_count
    FROM filtered_items fi
    ORDER BY fi.display_order ASC, fi.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 9. Function to get storage usage statistics
CREATE OR REPLACE FUNCTION public.get_storage_usage_stats()
RETURNS TABLE (
    total_files BIGINT,
    total_size BIGINT,
    by_category JSONB,
    by_status JSONB,
    recent_uploads BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_files,
        SUM((file_metadata->>'size')::BIGINT) as total_size,
        jsonb_object_agg(category, COUNT(*)) as by_category,
        jsonb_object_agg(status, COUNT(*)) as by_status,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_uploads
    FROM public.gallery_items
    WHERE storage_path IS NOT NULL;
END;
$$;

-- 10. Create storage access policies for the new bucket
-- Allow authenticated users to upload to wildout-images/moments/
CREATE POLICY "Authenticated users can upload to moments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'wildout-images' AND
    auth.role() = 'authenticated' AND
    name LIKE 'moments/%'
);

-- Allow public read access to moments folder
CREATE POLICY "Public can view moments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'wildout-images' AND
    name LIKE 'moments/%'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their moments"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'wildout-images' AND
    auth.role() = 'authenticated' AND
    name LIKE 'moments/%'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their moments"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'wildout-images' AND
    auth.role() = 'authenticated' AND
    name LIKE 'moments/%'
);

-- 11. Create trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_gallery_item_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gallery_items_update_timestamp ON public.gallery_items;
CREATE TRIGGER gallery_items_update_timestamp
    BEFORE UPDATE ON public.gallery_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_gallery_item_timestamp();

-- 12. Create data consistency check function
CREATE OR REPLACE FUNCTION public.check_gallery_storage_consistency()
RETURNS TABLE (
    item_id UUID,
    item_title TEXT,
    storage_path TEXT,
    issue_type TEXT,
    description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    -- Find items with storage paths that don't exist in storage
    SELECT
        gi.id,
        gi.title,
        gi.storage_path,
        'missing_file'::TEXT,
        'Gallery item references non-existent storage file'::TEXT
    FROM public.gallery_items gi
    WHERE
        gi.storage_path IS NOT NULL
        AND gi.storage_path != ''
        AND NOT EXISTS (
            SELECT 1 FROM storage.objects so
            WHERE so.bucket_id = 'wildout-images'
            AND so.name = gi.storage_path
        )

    UNION ALL

    -- Find items with processing issues
    SELECT
        gi.id,
        gi.title,
        gi.storage_path,
        'processing_failed'::TEXT,
        'Gallery item has failed processing status'::TEXT
    FROM public.gallery_items gi
    WHERE gi.processing_status = 'failed'

    UNION ALL

    -- Find orphaned storage files (not referenced by any gallery item)
    SELECT
        NULL::UUID,
        NULL::TEXT,
        so.name,
        'orphaned_file'::TEXT,
        'Storage file not referenced by any gallery item'::TEXT
    FROM storage.objects so
    WHERE
        so.bucket_id = 'wildout-images'
        AND so.name LIKE 'moments/%'
        AND NOT EXISTS (
            SELECT 1 FROM public.gallery_items gi
            WHERE gi.storage_path = so.name
        );
END;
$$;

-- 13. Create maintenance function for cleanup
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_storage_files()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_orphaned_files TEXT[];
BEGIN
    -- Get orphaned files (this would need to be called from backend with service role)
    -- For now, just return count
    SELECT COUNT(*) INTO v_deleted_count
    FROM storage.objects so
    WHERE
        so.bucket_id = 'wildout-images'
        AND so.name LIKE 'moments/%'
        AND NOT EXISTS (
            SELECT 1 FROM public.gallery_items gi
            WHERE gi.storage_path = so.name
        );

    RETURN v_deleted_count;
END;
$$;

-- 14. Update existing gallery_items to use storage paths if they have image_url
-- This is a migration helper that can be run once
CREATE OR REPLACE FUNCTION public.migrate_existing_gallery_to_storage()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER := 0;
    v_item RECORD;
BEGIN
    FOR v_item IN
        SELECT id, image_url
        FROM public.gallery_items
        WHERE storage_path IS NULL AND image_url IS NOT NULL AND image_url != ''
    LOOP
        -- Extract filename from URL and update storage_path
        -- This assumes existing URLs follow a pattern that can be converted
        UPDATE public.gallery_items
        SET
            storage_path = 'moments/' || id || '/' || substring(v_item.image_url from '[^/]+$'),
            processing_status = 'ready'
        WHERE id = v_item.id;

        v_updated_count := v_updated_count + 1;
    END LOOP;

    RETURN v_updated_count;
END;
$$;

-- 15. Create view for gallery items with enhanced metadata
CREATE OR REPLACE VIEW public.gallery_items_enhanced AS
SELECT
    gi.id,
    gi.title,
    gi.description,
    gi.image_url,
    gi.thumbnail_url,
    gi.category,
    gi.status,
    gi.tags,
    gi.display_order,
    gi.event_id,
    gi.partner_id,
    gi.storage_path,
    gi.file_metadata,
    gi.processing_status,
    gi.created_at,
    gi.updated_at,
    -- Enhanced metadata
    (gi.file_metadata->>'size')::BIGINT as file_size,
    (gi.file_metadata->>'width')::INTEGER as width,
    (gi.file_metadata->>'height')::INTEGER as height,
    (gi.file_metadata->>'mime_type') as mime_type,
    (gi.file_metadata->>'format') as format,
    -- Storage URL (constructed for public access)
    CASE
        WHEN gi.storage_path IS NOT NULL AND gi.storage_path != '' THEN
            'https://qhimllczaejftnuymrsr.supabase.co/storage/v1/object/public/wildout-images/' || gi.storage_path
        ELSE gi.image_url
    END as storage_public_url,
    -- File exists in storage flag
    EXISTS (
        SELECT 1 FROM storage.objects so
        WHERE so.bucket_id = 'wildout-images' AND so.name = gi.storage_path
    ) as file_exists
FROM public.gallery_items gi;

-- Grant permissions to authenticated users for the new functions
GRANT EXECUTE ON FUNCTION public.create_gallery_item_with_storage TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_gallery_item_storage TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_gallery_item_with_storage TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_gallery_items_paginated TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_gallery_storage_consistency TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_storage_operation TO authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_existing_gallery_to_storage TO authenticated;

-- Grant SELECT on enhanced view
GRANT SELECT ON public.gallery_items_enhanced TO authenticated;

-- Log migration completion
SELECT public.log_storage_operation(
    'update',
    'system',
    'migration/20251221_gallery_storage_migration',
    NULL,
    NULL,
    '{"migration_version": "20251221", "description": "Gallery storage migration completed"}'::JSONB,
    true,
    'Migration completed successfully'
);