-- Migration: 20251207_fix_function_signatures
-- Description: Fix function signatures to match frontend expectations
-- Created: 2025-12-07

-- =============================================
-- FIX FUNCTION SIGNATURES
-- =============================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_admin_sections_for_user(uuid);
DROP FUNCTION IF EXISTS public.get_section_content(text, uuid);

-- Recreate get_admin_sections_for_user with explicit parameter name
CREATE OR REPLACE FUNCTION public.get_admin_sections_for_user(p_user_id uuid)
RETURNS jsonb[]
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  sections jsonb[];
  user_role text := coalesce((SELECT role FROM profiles WHERE id = p_user_id), 'user');
  is_admin boolean := (user_role = 'admin');
  is_editor boolean := (user_role = 'editor' OR is_admin);
BEGIN
  SELECT array_agg(row_to_json(s)::jsonb) INTO sections
  FROM admin_sections s
  WHERE s.enabled = true
    AND (is_admin OR 
         (is_editor AND s.category IN ('main', 'content', 'management')));

  RETURN COALESCE(sections, ARRAY[]::jsonb[]);
END;
$$;

-- Recreate get_section_content with explicit parameter names
CREATE OR REPLACE FUNCTION public.get_section_content(p_section_slug text, p_user_id uuid DEFAULT null)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_role text := coalesce((SELECT role FROM profiles WHERE id = p_user_id), 'user');
  is_admin boolean := (user_role = 'admin');
  is_editor boolean := (user_role = 'editor' OR is_admin);
  content jsonb;
BEGIN
  -- Check permission
  IF p_user_id IS NOT NULL THEN
    IF NOT (is_admin OR is_editor OR 
           (SELECT can_view FROM role_permissions rp 
            JOIN profiles p ON rp.role = p.role 
            WHERE p.id = p_user_id AND rp.section_slug = p_section_slug)) THEN
      RETURN '{"error": "Insufficient permissions"}'::jsonb;
    END IF;
  END IF;

  SELECT sc.payload INTO content
  FROM section_content sc
  JOIN admin_sections s ON sc.section_id = s.id
  WHERE s.slug = p_section_slug AND sc.is_active = true
  ORDER BY sc.version DESC LIMIT 1;

  RETURN COALESCE(content, '{}'::jsonb);
END;
$$;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION public.get_admin_sections_for_user(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_section_content(text, uuid) TO authenticated, anon;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION public.get_admin_sections_for_user(uuid) IS 'Gets admin sections accessible to the user based on their role';
COMMENT ON FUNCTION public.get_section_content(text, uuid) IS 'Gets the latest content for a specific admin section';
