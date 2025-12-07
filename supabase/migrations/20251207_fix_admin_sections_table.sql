-- Migration: 20251207_fix_admin_sections_table
-- Description: Fix admin_sections table structure issues
-- Created: 2025-12-07

-- =============================================
-- FIX ADMIN_SECTIONS TABLE
-- =============================================

-- Add missing display_order column if it doesn't exist
ALTER TABLE IF EXISTS public.admin_sections ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Add missing category column if it doesn't exist
ALTER TABLE IF EXISTS public.admin_sections ADD COLUMN IF NOT EXISTS category text DEFAULT 'main';

-- Add missing enabled column if it doesn't exist
ALTER TABLE IF EXISTS public.admin_sections ADD COLUMN IF NOT EXISTS enabled boolean DEFAULT true;

-- Add index for display_order if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_admin_sections_display_order ON public.admin_sections(display_order);

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON COLUMN public.admin_sections.display_order IS 'Display order for admin sections in the dashboard';
COMMENT ON COLUMN public.admin_sections.category IS 'Category of admin section (main, content, management, etc.)';
COMMENT ON COLUMN public.admin_sections.enabled IS 'Whether the admin section is enabled and visible';