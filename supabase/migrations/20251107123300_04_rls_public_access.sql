-- Migration: 04_rls_public_access
-- Description: Row-Level Security implementation with default deny and public read access
-- Created: 2025-11-07

-- Default Deny Principle (Security Foundation)
-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Default deny policy - all access is blocked by default
-- This is the foundation of our security model
CREATE POLICY "default_deny_events" ON public.events FOR ALL USING (false);
CREATE POLICY "default_deny_partners" ON public.partners FOR ALL USING (false);
CREATE POLICY "default_deny_team_members" ON public.team_members FOR ALL USING (false);
CREATE POLICY "default_deny_gallery_items" ON public.gallery_items FOR ALL USING (false);
CREATE POLICY "default_deny_profiles" ON public.profiles FOR ALL USING (false);
CREATE POLICY "default_deny_audit_log" ON public.audit_log FOR ALL USING (false);

-- Helper Functions for JWT Claims Access
-- These functions provide safe access to JWT claims for RLS policies

CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS JSONB AS $$
    SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' -> claim, 'null'::jsonb);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
    SELECT COALESCE(get_my_claim('role') ->> 'role', 'anonymous');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT get_my_role() = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
    SELECT get_my_role() IN ('editor', 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_authenticated_user()
RETURNS BOOLEAN AS $$
    SELECT auth.role() = 'authenticated';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Public Read Access Policies
-- These policies allow public access to published content for the landing page

-- Public events (published only)
CREATE POLICY "public_read_published_events" ON public.events
    FOR SELECT USING (status = 'published');

-- Public partners (active only)
CREATE POLICY "public_read_active_partners" ON public.partners
    FOR SELECT USING (status = 'active');

-- Public team members (active only)
CREATE POLICY "public_read_active_team" ON public.team_members
    FOR SELECT USING (status = 'active');

-- Public gallery items (published only)
CREATE POLICY "public_read_published_gallery" ON public.gallery_items
    FOR SELECT USING (status = 'published');

-- Public profiles read access (limited fields for public team member display)
-- Note: This allows reading profiles but only for active team members
CREATE POLICY "public_read_team_profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.status = 'active'
            AND tm.email = (
                SELECT au.email FROM auth.users au WHERE au.id = profiles.id
            )
        )
    );

-- Audit log policies (admin only for security)
CREATE POLICY "admin_read_audit_log" ON public.audit_log
    FOR SELECT USING (is_admin());

-- Additional helper functions for complex policies

CREATE OR REPLACE FUNCTION can_user_edit_event(event_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
    event_record record;
    user_role text;
BEGIN
    -- Get user role
    user_role := get_my_role();

    -- Admins can edit all events
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;

    -- Get event details
    SELECT * INTO event_record FROM public.events WHERE id = event_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Editors can edit draft events
    IF user_role = 'editor' AND event_record.status = 'draft' THEN
        RETURN true;
    END IF;

    -- Users cannot edit events
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_user_edit_partner(partner_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
    partner_record record;
    user_role text;
BEGIN
    -- Get user role
    user_role := get_my_role();

    -- Admins can edit all partners
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;

    -- Get partner details
    SELECT * INTO partner_record FROM public.partners WHERE id = partner_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Editors can edit pending partners
    IF user_role = 'editor' AND partner_record.status = 'pending' THEN
        RETURN true;
    END IF;

    -- Users cannot edit partners
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_user_edit_gallery_item(item_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
    item_record record;
    user_role text;
BEGIN
    -- Get user role
    user_role := get_my_role();

    -- Admins can edit all gallery items
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;

    -- Get gallery item details
    SELECT * INTO item_record FROM public.gallery_items WHERE id = item_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Editors can edit draft gallery items
    IF user_role = 'editor' AND item_record.status = 'draft' THEN
        RETURN true;
    END IF;

    -- Check if user can edit the associated event or partner
    IF item_record.event_id IS NOT NULL AND can_user_edit_event(item_record.event_id) THEN
        RETURN true;
    END IF;

    IF item_record.partner_id IS NOT NULL AND can_user_edit_partner(item_record.partner_id) THEN
        RETURN true;
    END IF;

    -- Users cannot edit gallery items
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON POLICY "default_deny_events" ON public.events IS 'Default deny policy - blocks all access unless explicitly allowed';
COMMENT ON POLICY "public_read_published_events" ON public.events IS 'Allows public read access to published events for landing page';
COMMENT ON POLICY "public_read_active_partners" ON public.partners IS 'Allows public read access to active partners';
COMMENT ON POLICY "public_read_active_team" ON public.team_members IS 'Allows public read access to active team members';
COMMENT ON POLICY "public_read_published_gallery" ON public.gallery_items IS 'Allows public read access to published gallery items';

COMMENT ON FUNCTION get_my_claim IS 'Safely access JWT claims for RLS policies';
COMMENT ON FUNCTION get_my_role IS 'Get current user role from JWT claims';
COMMENT ON FUNCTION is_admin IS 'Check if current user is admin';
COMMENT ON FUNCTION is_editor_or_admin IS 'Check if current user is editor or admin';
COMMENT ON FUNCTION is_authenticated_user IS 'Check if current user is authenticated';
COMMENT ON FUNCTION can_user_edit_event IS 'Check if user can edit specific event';
COMMENT ON FUNCTION can_user_edit_partner IS 'Check if user can edit specific partner';
COMMENT ON FUNCTION can_user_edit_gallery_item IS 'Check if user can edit specific gallery item';
