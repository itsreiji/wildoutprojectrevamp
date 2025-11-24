-- RPCs for admin sections and content (fix 404s)
-- Per Task 12 Public Content Sync

-- get_admin_sections_for_user: return sections user can access based on role_permissions/user_permissions
CREATE OR REPLACE FUNCTION public.get_admin_sections_for_user(user_id uuid DEFAULT null)
RETURNS jsonb[]
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  sections jsonb[];
  user_role text := coalesce((SELECT role FROM profiles WHERE id = user_id), 'user');
  is_admin boolean := (user_role = 'admin');
  is_editor boolean := (user_role = 'editor' OR is_admin);
BEGIN
  SELECT array_agg(row_to_json(s)::jsonb) INTO sections
  FROM admin_sections s
  WHERE enabled = true
    AND (is_admin OR 
         (is_editor AND s.category IN ('main', 'content', 'management')) OR
         true); -- All for admin

  RETURN COALESCE(sections, ARRAY[]::jsonb[]);
END;
$$;

-- get_section_content: fetch for section + user permissions
CREATE OR REPLACE FUNCTION public.get_section_content(section_slug text, user_id uuid DEFAULT null)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_role text := coalesce((SELECT role FROM profiles WHERE id = user_id), 'user');
  is_admin boolean := (user_role = 'admin');
  is_editor boolean := (user_role = 'editor' OR is_admin);
  content jsonb;
BEGIN
  -- Check permission
  IF NOT (is_admin OR is_editor OR (SELECT can_view FROM role_permissions rp JOIN profiles p ON rp.role = p.role WHERE p.id = user_id AND rp.section_slug = section_slug)) THEN
    RAISE EXCEPTION 'Insufficient permissions for section %', section_slug;
  END IF;

  SELECT sc.payload INTO content
  FROM section_content sc
  JOIN admin_sections s ON sc.section_id = s.id
  WHERE s.slug = section_slug AND sc.is_active = true
  ORDER BY sc.version DESC LIMIT 1;

  RETURN COALESCE(content, '{}'::jsonb);
END;
$$;

-- update_section_content
CREATE OR REPLACE FUNCTION public.update_section_content(section_slug text, new_payload jsonb, user_id uuid DEFAULT null)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  section_id uuid;
  user_role text := coalesce((SELECT role FROM profiles WHERE id = user_id), 'user');
BEGIN
  SELECT id INTO section_id FROM admin_sections WHERE slug = section_slug;
  
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = user_id AND p.role IN ('admin', 'editor')) THEN
    RAISE EXCEPTION 'Admin/Editor required';
  END IF;

  INSERT INTO section_content (section_id, payload, created_by)
  VALUES (section_id, new_payload, user_id)
  ON CONFLICT (section_id) DO UPDATE SET
    payload = new_payload,
    is_active = false,
    updated_by = user_id,
    updated_at = now()
  WHERE section_content.section_id = section_id AND is_active = true
  RETURNING payload;
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.get_admin_sections_for_user TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_section_content TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_section_content TO authenticated;
