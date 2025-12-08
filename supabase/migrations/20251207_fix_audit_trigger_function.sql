-- Migration: Fix audit trigger function to handle missing auth gracefully
-- Created: 2025-12-07

BEGIN;

-- Drop existing triggers first to avoid dependency issues
DROP TRIGGER IF EXISTS audit_team_members ON public.team_members;
DROP TRIGGER IF EXISTS audit_events ON public.events;
DROP TRIGGER IF EXISTS audit_partners ON public.partners;
DROP TRIGGER IF EXISTS audit_gallery_items ON public.gallery_items;
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.audit_trigger_function();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id uuid;
    current_user_role text;
    audit_action text;
    old_row jsonb;
    new_row jsonb;
    jwt_claims jsonb;
    record_id_val text;
BEGIN
    -- Safely get JWT claims
    BEGIN
        jwt_claims := current_setting('request.jwt.claims', true)::jsonb;
    EXCEPTION WHEN OTHERS THEN
        jwt_claims := '{}'::jsonb;
    END;

    -- Get current user info (if authenticated)
    BEGIN
        current_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    -- Get user role safely
    current_user_role := COALESCE(
        jwt_claims -> 'app_metadata' ->> 'role',
        'anonymous'
    );

    -- Determine action type and get record ID
    IF TG_OP = 'INSERT' THEN
        audit_action := 'INSERT';
        old_row := NULL;
        new_row := to_jsonb(NEW);
        record_id_val := (NEW.id)::text;
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action := 'UPDATE';
        old_row := to_jsonb(OLD);
        new_row := to_jsonb(NEW);
        record_id_val := (NEW.id)::text;
    ELSIF TG_OP = 'DELETE' THEN
        audit_action := 'DELETE';
        old_row := to_jsonb(OLD);
        new_row := NULL;
        record_id_val := (OLD.id)::text;
    END IF;

    -- Insert audit record
    INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id,
        user_role,
        session_id,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        record_id_val,
        audit_action,
        old_row,
        new_row,
        current_user_id,
        current_user_role,
        jwt_claims ->> 'session_id',
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers with proper error handling
CREATE TRIGGER audit_events
    AFTER INSERT OR UPDATE OR DELETE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_partners
    AFTER INSERT OR UPDATE OR DELETE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_team_members
    AFTER INSERT OR UPDATE OR DELETE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_gallery_items
    AFTER INSERT OR UPDATE OR DELETE ON public.gallery_items
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

COMMIT;
