-- Migration: 20250118_cleanup_duplicates
-- Description: Remove duplicate data from all tables, keeping the most recent/complete records
-- Created: 2025-01-18

-- =============================================
-- CLEANUP DUPLICATE PARTNERS
-- =============================================
-- Remove duplicate partners based on name (which should be UNIQUE)
-- Keep the record with the most recent updated_at or created_at
DO $$
DECLARE
    duplicate_count integer;
BEGIN
    -- Delete duplicate partners, keeping the one with the latest updated_at
    WITH ranked_partners AS (
        SELECT 
            id,
            name,
            ROW_NUMBER() OVER (
                PARTITION BY LOWER(TRIM(name)) 
                ORDER BY updated_at DESC, created_at DESC, id
            ) as rn
        FROM public.partners
    )
    DELETE FROM public.partners
    WHERE id IN (
        SELECT id FROM ranked_partners WHERE rn > 1
    );
    
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate partner(s)', duplicate_count;
END $$;

-- =============================================
-- CLEANUP DUPLICATE EVENTS
-- =============================================
-- Remove duplicate events based on title + start_date combination
-- Keep the record with the most recent updated_at or most complete data
DO $$
DECLARE
    duplicate_count integer;
BEGIN
    -- First, update any events that reference deleted partners
    UPDATE public.events
    SET partner_id = NULL, partner_name = NULL, partner_logo_url = NULL
    WHERE partner_id IS NOT NULL 
    AND partner_id NOT IN (SELECT id FROM public.partners);
    
    -- Delete duplicate events, keeping the one with the latest updated_at or most complete data
    WITH ranked_events AS (
        SELECT 
            id,
            title,
            start_date,
            ROW_NUMBER() OVER (
                PARTITION BY LOWER(TRIM(title)), start_date
                ORDER BY 
                    CASE WHEN description IS NOT NULL AND description != '' THEN 1 ELSE 0 END DESC,
                    CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END DESC,
                    updated_at DESC, 
                    created_at DESC, 
                    id
            ) as rn
        FROM public.events
    )
    DELETE FROM public.events
    WHERE id IN (
        SELECT id FROM ranked_events WHERE rn > 1
    );
    
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate event(s)', duplicate_count;
END $$;

-- =============================================
-- CLEANUP DUPLICATE TEAM MEMBERS
-- =============================================
-- Remove duplicate team members based on name + email combination
-- Keep the record with the most recent updated_at or most complete data
DO $$
DECLARE
    duplicate_count integer;
BEGIN
    WITH ranked_team AS (
        SELECT 
            id,
            name,
            email,
            ROW_NUMBER() OVER (
                PARTITION BY 
                    LOWER(TRIM(name)),
                    COALESCE(LOWER(TRIM(email)), '')
                ORDER BY 
                    CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END DESC,
                    CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END DESC,
                    updated_at DESC, 
                    created_at DESC, 
                    id
            ) as rn
        FROM public.team_members
    )
    DELETE FROM public.team_members
    WHERE id IN (
        SELECT id FROM ranked_team WHERE rn > 1
    );
    
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate team member(s)', duplicate_count;
END $$;

-- =============================================
-- CLEANUP DUPLICATE GALLERY ITEMS
-- =============================================
-- Remove duplicate gallery items based on image_url + event_id/partner_id combination
-- Keep the record with the most recent updated_at or most complete data
DO $$
DECLARE
    duplicate_count integer;
BEGIN
    -- First, update any gallery items that reference deleted events or partners
    UPDATE public.gallery_items
    SET event_id = NULL
    WHERE event_id IS NOT NULL 
    AND event_id NOT IN (SELECT id FROM public.events);
    
    UPDATE public.gallery_items
    SET partner_id = NULL
    WHERE partner_id IS NOT NULL 
    AND partner_id NOT IN (SELECT id FROM public.partners);
    
    -- Delete duplicate gallery items, keeping the one with the latest updated_at
    WITH ranked_gallery AS (
        SELECT 
            id,
            image_url,
            event_id,
            partner_id,
            ROW_NUMBER() OVER (
                PARTITION BY 
                    image_url,
                    COALESCE(event_id::text, ''),
                    COALESCE(partner_id::text, '')
                ORDER BY 
                    CASE WHEN description IS NOT NULL AND description != '' THEN 1 ELSE 0 END DESC,
                    updated_at DESC, 
                    created_at DESC, 
                    id
            ) as rn
        FROM public.gallery_items
    )
    DELETE FROM public.gallery_items
    WHERE id IN (
        SELECT id FROM ranked_gallery WHERE rn > 1
    );
    
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate gallery item(s)', duplicate_count;
END $$;

-- =============================================
-- CLEANUP ORPHANED RECORDS
-- =============================================
-- Remove gallery items that have invalid relationships
DO $$
DECLARE
    orphaned_count integer;
BEGIN
    -- Delete gallery items with invalid event_id references
    DELETE FROM public.gallery_items
    WHERE event_id IS NOT NULL 
    AND event_id NOT IN (SELECT id FROM public.events);
    
    GET DIAGNOSTICS orphaned_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned gallery item(s) with invalid event_id', orphaned_count;
    
    -- Delete gallery items with invalid partner_id references
    DELETE FROM public.gallery_items
    WHERE partner_id IS NOT NULL 
    AND partner_id NOT IN (SELECT id FROM public.partners);
    
    GET DIAGNOSTICS orphaned_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % orphaned gallery item(s) with invalid partner_id', orphaned_count;
END $$;

-- =============================================
-- VERIFY UNIQUENESS CONSTRAINTS
-- =============================================
-- Ensure partners.name is unique (should already be enforced by schema, but verify)
DO $$
BEGIN
    -- Check if unique constraint exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'partners_name_key'
    ) THEN
        ALTER TABLE public.partners ADD CONSTRAINT partners_name_key UNIQUE (name);
        RAISE NOTICE 'Added unique constraint on partners.name';
    END IF;
END $$;

-- =============================================
-- SUMMARY
-- =============================================
DO $$
DECLARE
    partners_count integer;
    events_count integer;
    team_count integer;
    gallery_count integer;
BEGIN
    SELECT COUNT(*) INTO partners_count FROM public.partners;
    SELECT COUNT(*) INTO events_count FROM public.events;
    SELECT COUNT(*) INTO team_count FROM public.team_members;
    SELECT COUNT(*) INTO gallery_count FROM public.gallery_items;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Cleanup Complete - Final Record Counts:';
    RAISE NOTICE 'Partners: %', partners_count;
    RAISE NOTICE 'Events: %', events_count;
    RAISE NOTICE 'Team Members: %', team_count;
    RAISE NOTICE 'Gallery Items: %', gallery_count;
    RAISE NOTICE '========================================';
END $$;

