-- Phase 2: Fix Security (Mutable Search Path) and Performance (RLS InitPlan)

-- 1. Fix Mutable Search Path for Functions
-- We explicitly set search_path to public for all security definer functions (or just all custom functions to be safe/consistent)

ALTER FUNCTION public.is_editor_or_admin_via_jwt() SET search_path = public;
ALTER FUNCTION public.get_admin_sections_for_user(uuid) SET search_path = public;
ALTER FUNCTION public.get_hero_content() SET search_path = public;
ALTER FUNCTION public.get_about_content() SET search_path = public;
ALTER FUNCTION public.get_site_settings() SET search_path = public;
ALTER FUNCTION public.create_user_session(text, integer) SET search_path = public;
ALTER FUNCTION public.get_my_claim(text) SET search_path = public;
ALTER FUNCTION public.validate_user_session(text) SET search_path = public;
ALTER FUNCTION public.invalidate_user_session(text) SET search_path = public;
ALTER FUNCTION public.get_events_near_location(numeric, numeric, numeric, integer) SET search_path = public;
ALTER FUNCTION public.update_event_attendance(uuid, boolean) SET search_path = public;
ALTER FUNCTION public.refresh_monthly_event_stats() SET search_path = public;
ALTER FUNCTION public.get_section_content(text) SET search_path = public;
-- generate_unique_username already done
ALTER FUNCTION public.update_section_content(text, jsonb, uuid) SET search_path = public;
ALTER FUNCTION public.admin_create_profile(uuid, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.is_authenticated_user() SET search_path = public;
ALTER FUNCTION public.can_user_edit_event(uuid) SET search_path = public;
ALTER FUNCTION public.can_user_edit_partner(uuid) SET search_path = public;
ALTER FUNCTION public.can_user_edit_gallery_item(uuid) SET search_path = public;
ALTER FUNCTION public.get_event_with_artists(uuid) SET search_path = public;
ALTER FUNCTION public.has_role(text) SET search_path = public;
ALTER FUNCTION public.has_any_role(text[]) SET search_path = public;
ALTER FUNCTION public.get_event_artists(uuid) SET search_path = public;
ALTER FUNCTION public.bulk_archive_past_events() SET search_path = public;
ALTER FUNCTION public.moderate_content(uuid, text) SET search_path = public;
ALTER FUNCTION public.update_profile_role(uuid, text) SET search_path = public;
ALTER FUNCTION public.get_user_profile(uuid) SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_editor_or_admin() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_user_deleted() SET search_path = public;
-- sync_profile_from_auth already done

-- 2. Fix RLS InitPlan Performance (Wrap auth calls in select)

-- admin_sections
DROP POLICY IF EXISTS "Admin full access to admin_sections" ON public.admin_sections;
CREATE POLICY "Admin full access to admin_sections" ON public.admin_sections
FOR ALL TO public
USING ((select auth.role()) = 'admin')
WITH CHECK ((select auth.role()) = 'admin');

-- section_content
DROP POLICY IF EXISTS "Admin full access to section_content" ON public.section_content;
CREATE POLICY "Admin full access to section_content" ON public.section_content
FOR ALL TO public
USING ((select auth.role()) = 'admin')
WITH CHECK ((select auth.role()) = 'admin');

DROP POLICY IF EXISTS "Users can view section_content based on permissions" ON public.section_content;
CREATE POLICY "Users can view section_content based on permissions" ON public.section_content
FOR SELECT TO public
USING (
  (EXISTS (
    SELECT 1 FROM role_permissions rp
    JOIN profiles p ON p.role = rp.role
    WHERE rp.section_slug = (SELECT slug FROM admin_sections WHERE id = section_content.section_id)
    AND rp.can_view = true
    AND p.id = (select auth.uid())
  ))
  OR
  (EXISTS (
    SELECT 1 FROM user_permissions up
    WHERE up.profile_id = (select auth.uid())
    AND up.section_slug = (SELECT slug FROM admin_sections WHERE id = section_content.section_id)
    AND up.can_view = true
  ))
);

-- role_permissions
DROP POLICY IF EXISTS "Admin full access to role_permissions" ON public.role_permissions;
CREATE POLICY "Admin full access to role_permissions" ON public.role_permissions
FOR ALL TO public
USING ((select auth.role()) = 'admin')
WITH CHECK ((select auth.role()) = 'admin');

-- user_permissions
DROP POLICY IF EXISTS "Admin full access to user_permissions" ON public.user_permissions;
CREATE POLICY "Admin full access to user_permissions" ON public.user_permissions
FOR ALL TO public
USING ((select auth.role()) = 'admin')
WITH CHECK ((select auth.role()) = 'admin');

-- artists
DROP POLICY IF EXISTS "authenticated_read_artists" ON public.artists;
CREATE POLICY "authenticated_read_artists" ON public.artists
FOR SELECT TO public
USING ((select auth.role()) = 'authenticated');
