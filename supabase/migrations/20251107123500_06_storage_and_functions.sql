-- Migration: 06_storage_and_functions
-- Description: Application functions and Edge Functions setup
-- Created: 2025-11-07

-- Helper functions for application logic
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(get_my_role(), 'anonymous') = 'admin';
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(get_my_role(), 'anonymous') IN ('editor', 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- Edge Functions directory structure will be created by Supabase CLI
-- The actual Edge Functions would be created with: supabase functions new <name>

-- Example Edge Function SQL helpers (these would be called from Edge Functions)

-- Function for bulk event operations (admin only)
CREATE OR REPLACE FUNCTION bulk_archive_past_events()
RETURNS TABLE (archived_count integer) AS $$
DECLARE
    archived_count integer := 0;
BEGIN
    -- Only admins can perform bulk operations
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only administrators can perform bulk operations';
    END IF;

    -- Archive events that ended more than 30 days ago
    UPDATE public.events
    SET status = 'archived', updated_at = now()
    WHERE status = 'published'
        AND end_date < CURRENT_DATE - INTERVAL '30 days';

    GET DIAGNOSTICS archived_count = ROW_COUNT;

    RETURN QUERY SELECT archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for content moderation
CREATE OR REPLACE FUNCTION moderate_content(content_id uuid, action text)
RETURNS boolean AS $$
BEGIN
    -- Only editors and admins can moderate content
    IF NOT public.is_editor_or_admin() THEN
        RAISE EXCEPTION 'Only editors and administrators can moderate content';
    END IF;

    IF action = 'approve' THEN
        UPDATE public.gallery_items
        SET status = 'published', updated_at = now()
        WHERE id = content_id AND status = 'draft';

        UPDATE public.events
        SET status = 'published', updated_at = now()
        WHERE id = content_id AND status = 'draft';
    ELSIF action = 'reject' THEN
        UPDATE public.gallery_items
        SET status = 'archived', updated_at = now()
        WHERE id = content_id;

        UPDATE public.events
        SET status = 'cancelled', updated_at = now()
        WHERE id = content_id;
    ELSE
        RAISE EXCEPTION 'Invalid moderation action. Use approve or reject.';
    END IF;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Performance monitoring view for the application
CREATE VIEW system_performance AS
SELECT
    'events' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as records_last_week
FROM public.events
UNION ALL
SELECT
    'partners' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as records_last_week
FROM public.partners
UNION ALL
SELECT
    'team_members' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as records_last_week
FROM public.team_members
ORDER BY record_count DESC;

-- Comments for documentation
COMMENT ON VIEW system_performance IS 'Overall system performance metrics';
COMMENT ON FUNCTION bulk_archive_past_events IS 'Admin function to archive old events';
COMMENT ON FUNCTION moderate_content IS 'Content moderation for editors and admins';
