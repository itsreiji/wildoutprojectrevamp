-- Migration: 05_rls_admin_authenticated
-- Description: Row-Level Security policies for authenticated and admin users
-- Created: 2025-11-07

-- Working with existing schema - just update the policies to use our helper functions
-- The existing policies are already in place, we just need to ensure they use our functions

-- Update existing admin policies to use our helper functions
-- Note: We can't DROP and CREATE existing policies that are already working,
-- so we'll ADD new policies that complement the existing ones

CREATE POLICY "admin_full_access_events" ON public.events
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "admin_full_access_partners" ON public.partners
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "admin_full_access_team_members" ON public.team_members
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "admin_full_access_gallery_items" ON public.gallery_items
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "admin_full_access_profiles" ON public.profiles
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- Editor Policies
-- Editors have limited access for content management

CREATE POLICY "editor_read_events" ON public.events
    FOR SELECT USING (get_my_role() = 'editor');

CREATE POLICY "editor_write_draft_events" ON public.events
    FOR INSERT WITH CHECK (get_my_role() = 'editor' AND status = 'draft');

CREATE POLICY "editor_update_draft_events" ON public.events
    FOR UPDATE USING (get_my_role() = 'editor' AND status = 'draft')
    WITH CHECK (get_my_role() = 'editor' AND status IN ('draft', 'published'));

CREATE POLICY "editor_delete_draft_events" ON public.events
    FOR DELETE USING (get_my_role() = 'editor' AND status = 'draft');

CREATE POLICY "editor_read_partners" ON public.partners
    FOR SELECT USING (get_my_role() = 'editor');

CREATE POLICY "editor_write_pending_partners" ON public.partners
    FOR INSERT WITH CHECK (get_my_role() = 'editor' AND status = 'pending');

CREATE POLICY "editor_update_pending_partners" ON public.partners
    FOR UPDATE USING (get_my_role() = 'editor' AND status = 'pending')
    WITH CHECK (get_my_role() = 'editor' AND status IN ('pending', 'active'));

CREATE POLICY "editor_read_gallery" ON public.gallery_items
    FOR SELECT USING (get_my_role() = 'editor');

CREATE POLICY "editor_write_draft_gallery" ON public.gallery_items
    FOR INSERT WITH CHECK (get_my_role() = 'editor' AND status = 'draft');

CREATE POLICY "editor_update_draft_gallery" ON public.gallery_items
    FOR UPDATE USING (get_my_role() = 'editor' AND status = 'draft')
    WITH CHECK (get_my_role() = 'editor' AND status IN ('draft', 'published'));

-- User Profile Management
-- Users can manage their own profiles

CREATE POLICY "users_read_own_profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        -- Users cannot change their own role
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

-- Authenticated User Basic Access
-- Authenticated users get slightly better access than anonymous users

CREATE POLICY "authenticated_read_all_published_events" ON public.events
    FOR SELECT USING (is_authenticated_user() AND status = 'published');

CREATE POLICY "authenticated_read_all_active_partners" ON public.partners
    FOR SELECT USING (is_authenticated_user() AND status = 'active');

CREATE POLICY "authenticated_read_all_team" ON public.team_members
    FOR SELECT USING (is_authenticated_user() AND status = 'active');

CREATE POLICY "authenticated_read_all_gallery" ON public.gallery_items
    FOR SELECT USING (is_authenticated_user() AND status = 'published');

-- Advanced Policies for Content Management
-- These policies allow editors and admins to manage content appropriately

CREATE POLICY "editor_manage_event_gallery" ON public.gallery_items
    FOR ALL USING (
        get_my_role() = 'editor'
        AND event_id IS NOT NULL
        AND can_user_edit_event(event_id)
    )
    WITH CHECK (
        get_my_role() = 'editor'
        AND event_id IS NOT NULL
        AND can_user_edit_event(event_id)
    );

CREATE POLICY "editor_manage_partner_gallery" ON public.gallery_items
    FOR ALL USING (
        get_my_role() = 'editor'
        AND partner_id IS NOT NULL
        AND can_user_edit_partner(partner_id)
    )
    WITH CHECK (
        get_my_role() = 'editor'
        AND partner_id IS NOT NULL
        AND can_user_edit_partner(partner_id)
    );

-- Audit Log Policies for Different Roles
-- More granular access to audit logs

CREATE POLICY "editor_read_recent_audit" ON public.audit_log
    FOR SELECT USING (
        get_my_role() = 'editor'
        AND created_at > (now() - interval '7 days')
    );

CREATE POLICY "admin_full_audit_access" ON public.audit_log
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- Team Member Policies
-- Allow team members to update their own information if they have a profile

CREATE POLICY "team_member_update_own_info" ON public.team_members
    FOR UPDATE USING (
        is_authenticated_user()
        AND email = (SELECT au.email FROM auth.users au WHERE au.id = auth.uid())
    )
    WITH CHECK (
        is_authenticated_user()
        AND email = (SELECT au.email FROM auth.users au WHERE au.id = auth.uid())
        AND status = 'active' -- Cannot change status
    );

-- Partner Management Policies
-- Allow partners to manage their own information

CREATE POLICY "partner_update_own_info" ON public.partners
    FOR UPDATE USING (
        is_authenticated_user()
        AND contact_email = (SELECT au.email FROM auth.users au WHERE au.id = auth.uid())
    )
    WITH CHECK (
        is_authenticated_user()
        AND contact_email = (SELECT au.email FROM auth.users au WHERE au.id = auth.uid())
        AND status IN ('active', 'inactive') -- Cannot set to pending
    );

-- Event Organizer Policies
-- Allow event organizers (partners) to manage their events

CREATE POLICY "partner_manage_own_events" ON public.events
    FOR ALL USING (
        is_authenticated_user()
        AND partner_id IN (
            SELECT id FROM public.partners
            WHERE contact_email = (SELECT au.email FROM auth.users au WHERE au.id = auth.uid())
            AND status = 'active'
        )
    )
    WITH CHECK (
        is_authenticated_user()
        AND partner_id IN (
            SELECT id FROM public.partners
            WHERE contact_email = (SELECT au.email FROM auth.users au WHERE au.id = auth.uid())
            AND status = 'active'
        )
        AND status IN ('draft', 'published') -- Cannot archive or cancel
    );

-- Comments for documentation
COMMENT ON POLICY "admin_full_access_events" ON public.events IS 'Admin users have full CRUD access to all events';
COMMENT ON POLICY "editor_write_draft_events" ON public.events IS 'Editors can create and manage draft events';
COMMENT ON POLICY "users_update_own_profile" ON public.profiles IS 'Users can update their own profile but not change roles';
COMMENT ON POLICY "authenticated_read_all_published_events" ON public.events IS 'Authenticated users can read all published events';
COMMENT ON POLICY "partner_manage_own_events" ON public.events IS 'Partners can manage events associated with their organization';
