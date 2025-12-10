-- Phase 5: The Final Sweep

-- 1. Fix Mutable Search Path for Remaining Functions
ALTER FUNCTION public.create_user_session(text, integer) SET search_path = public;
ALTER FUNCTION public.get_admin_sections_for_user(uuid) SET search_path = public;
ALTER FUNCTION public.get_my_role() SET search_path = public;
ALTER FUNCTION public.get_section_content(text) SET search_path = public;
-- get_section_content overloaded?
ALTER FUNCTION public.get_section_content(text, uuid) SET search_path = public;
ALTER FUNCTION public.get_upcoming_events_week() SET search_path = public;
ALTER FUNCTION public.update_event_attendance(uuid, boolean) SET search_path = public;

-- 2. Fix RLS InitPlans (Optimization)

-- hero_content
DROP POLICY IF EXISTS "Admin write access for hero content" ON public.hero_content;
CREATE POLICY "Admin write access for hero content" ON public.hero_content
FOR ALL TO public
USING ((select auth.role()) = 'service_role' OR (select is_admin()));

-- site_settings
DROP POLICY IF EXISTS "Admin write access for site settings" ON public.site_settings;
CREATE POLICY "Admin write access for site settings" ON public.site_settings
FOR ALL TO public
USING ((select auth.role()) = 'service_role' OR (select is_admin()));

-- team_members
DROP POLICY IF EXISTS "Admins full access team_members" ON public.team_members;
CREATE POLICY "Admins full access team_members" ON public.team_members
FOR ALL TO public
USING ((select auth.role()) = 'service_role' OR (select is_admin()))
WITH CHECK ((select auth.role()) = 'service_role' OR (select is_admin()));

DROP POLICY IF EXISTS "Editors and Admins can manage team_members" ON public.team_members;
CREATE POLICY "Editors and Admins can manage team_members" ON public.team_members
FOR ALL TO public
USING ((select is_editor_or_admin_via_jwt()))
WITH CHECK ((select is_editor_or_admin_via_jwt()));

DROP POLICY IF EXISTS "Authenticated users can read active team members" ON public.team_members;
CREATE POLICY "Authenticated users can read active team members" ON public.team_members
FOR SELECT TO public
USING ((select auth.role()) = 'authenticated' AND status = 'active');


-- events partial optimization (Editor+ policies)
-- Note: is_editor_or_admin_via_jwt is now immutable search_path but wrapping in select is better cache practice? 
-- Actually is_editor_or_admin_via_jwt calls auth.jwt() inside.
-- Best to wrap the function Call itself? Postgres might optimize function volatility.
-- But the linter specifically complains about auth.<func>.
-- Let's assume custom functions wrapping auth calls are "Better" but let's wrap the custom function in select just in case.

DROP POLICY IF EXISTS "Editors+ manage events" ON public.events;
CREATE POLICY "Editors+ manage events" ON public.events
FOR ALL TO public
USING ((select is_editor_or_admin_via_jwt()))
WITH CHECK ((select is_editor_or_admin_via_jwt()));


-- partners partial optimization
DROP POLICY IF EXISTS "editor_read_partners" ON public.partners;
CREATE POLICY "editor_read_partners" ON public.partners
FOR SELECT TO public
USING ((select get_my_role()) = 'editor');

DROP POLICY IF EXISTS "authenticated_read_all_active_partners" ON public.partners;
CREATE POLICY "authenticated_read_all_active_partners" ON public.partners
FOR SELECT TO public
USING ((select auth.role()) = 'authenticated' AND status = 'active');
