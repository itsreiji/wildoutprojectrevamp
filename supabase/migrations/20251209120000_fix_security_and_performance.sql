-- Fix Performance: Add indexes for unindexed foreign keys
CREATE INDEX IF NOT EXISTS idx_hero_content_updated_by ON public.hero_content(updated_by);
CREATE INDEX IF NOT EXISTS idx_about_content_updated_by ON public.about_content(updated_by);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON public.site_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_admin_sections_created_by ON public.admin_sections(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_sections_updated_by ON public.admin_sections(updated_by);
CREATE INDEX IF NOT EXISTS idx_section_content_created_by ON public.section_content(created_by);
CREATE INDEX IF NOT EXISTS idx_section_content_updated_by ON public.section_content(updated_by);
CREATE INDEX IF NOT EXISTS idx_role_permissions_created_by ON public.role_permissions(created_by);
CREATE INDEX IF NOT EXISTS idx_role_permissions_updated_by ON public.role_permissions(updated_by);
CREATE INDEX IF NOT EXISTS idx_user_permissions_created_by ON public.user_permissions(created_by);
CREATE INDEX IF NOT EXISTS idx_user_permissions_updated_by ON public.user_permissions(updated_by);
CREATE INDEX IF NOT EXISTS idx_event_artists_created_by ON public.event_artists(created_by);
CREATE INDEX IF NOT EXISTS idx_artists_created_by ON public.artists(created_by);

-- Fix Security: Set views to security_invoker to respect RLS
ALTER VIEW public.partner_events SET (security_invoker = true);
ALTER VIEW public.public_events_view SET (security_invoker = true);
ALTER VIEW public.system_performance SET (security_invoker = true);

-- Fix Security: Set search_path for SECURITY DEFINER function
ALTER FUNCTION public.sync_profile_from_auth(uuid) SET search_path = public;
