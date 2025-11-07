-- Migration: 02_auth_schema
-- Description: Enhanced authentication schema with RBAC, JWT claims, and audit logging
-- Created: 2025-11-07

-- Enhanced profiles table with RBAC
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username text UNIQUE,
    full_name text,
    avatar_url text,
    role text DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for profiles table
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX idx_profiles_metadata ON public.profiles USING gin(metadata);

-- Custom JWT Claims for Role-Based Access Control
-- Function to update user claims when profile role changes
CREATE OR REPLACE FUNCTION public.update_user_claims()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if role actually changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced updated_at Trigger Function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles table
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Audit Logging Setup
CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data jsonb,
    new_data jsonb,
    user_id uuid REFERENCES auth.users(id),
    user_role text,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for audit logging
CREATE INDEX idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id uuid;
    current_user_role text;
    audit_action text;
    old_row jsonb;
    new_row jsonb;
BEGIN
    -- Get current user info (if authenticated)
    current_user_id := auth.uid();
    current_user_role := COALESCE(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', 'anonymous');

    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        audit_action := 'INSERT';
        old_row := NULL;
        new_row := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action := 'UPDATE';
        old_row := to_jsonb(OLD);
        new_row := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        audit_action := 'DELETE';
        old_row := to_jsonb(OLD);
        new_row := NULL;
    END IF;

    -- Insert audit record
    INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id,
        user_role
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        audit_action,
        old_row,
        new_row,
        current_user_id,
        current_user_role
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to business tables
CREATE TRIGGER audit_events
    AFTER INSERT OR UPDATE OR DELETE ON public.events
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_partners
    AFTER INSERT OR UPDATE OR DELETE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_team_members
    AFTER INSERT OR UPDATE OR DELETE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_gallery_items
    AFTER INSERT OR UPDATE OR DELETE ON public.gallery_items
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Helper functions for JWT claims access
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

-- Function to safely update profile role (with admin check)
CREATE OR REPLACE FUNCTION update_profile_role(user_id uuid, new_role text)
RETURNS boolean AS $$
DECLARE
    current_user_role text;
BEGIN
    -- Check if current user is admin
    current_user_role := get_my_role();
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can update user roles';
    END IF;

    -- Validate role
    IF new_role NOT IN ('admin', 'editor', 'user') THEN
        RAISE EXCEPTION 'Invalid role. Must be one of: admin, editor, user';
    END IF;

    -- Update the profile
    UPDATE public.profiles
    SET role = new_role, updated_at = now()
    WHERE id = user_id;

    -- Check if update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with role information
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid uuid DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    username text,
    full_name text,
    avatar_url text,
    role text,
    metadata jsonb,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.role,
        p.metadata,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.id = COALESCE(user_uuid, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE public.audit_log IS 'Comprehensive audit trail for all data modifications';

COMMENT ON FUNCTION update_user_claims IS 'Updates JWT claims when user role changes';
COMMENT ON FUNCTION handle_updated_at IS 'Generic trigger function for updating timestamps';
COMMENT ON FUNCTION audit_trigger_function IS 'Generic audit logging trigger function';
COMMENT ON FUNCTION get_my_claim IS 'Helper function to access JWT claims';
COMMENT ON FUNCTION get_my_role IS 'Get current user role from JWT claims';
COMMENT ON FUNCTION is_admin IS 'Check if current user is admin';
COMMENT ON FUNCTION is_editor_or_admin IS 'Check if current user is editor or admin';
COMMENT ON FUNCTION update_profile_role IS 'Safely update user role with admin authorization';
COMMENT ON FUNCTION get_user_profile IS 'Get user profile with role information';
