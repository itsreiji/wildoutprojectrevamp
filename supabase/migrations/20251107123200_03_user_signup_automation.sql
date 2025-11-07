-- Migration: 03_user_signup_automation
-- Description: Automatic user profile creation and role propagation triggers
-- Created: 2025-11-07

-- Implement automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role text := 'user';
    user_full_name text;
    user_avatar_url text;
BEGIN
    -- Extract user information from auth metadata
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );

    user_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
    );

    -- Create profile record
    INSERT INTO public.profiles (
        id,
        full_name,
        avatar_url,
        role,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        user_full_name,
        user_avatar_url,
        user_role,
        NEW.raw_user_meta_data,
        now(),
        now()
    );

    -- Set initial JWT claims
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', user_role)
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate with our function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for automatic execution
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for role updates to propagate to JWT claims
CREATE TRIGGER on_profile_role_update
    AFTER UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_user_claims();

-- Function to handle user deletion cleanup
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the deletion in audit log
    INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        old_data,
        user_id,
        user_role
    ) VALUES (
        'profiles',
        OLD.id,
        'DELETE',
        to_jsonb(OLD),
        OLD.id,
        COALESCE(OLD.role, 'unknown')
    );

    -- Profile will be automatically deleted due to CASCADE constraint
    -- Additional cleanup can be added here if needed

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion logging
CREATE TRIGGER on_profile_deleted
    AFTER DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_deleted();

-- Function to validate username uniqueness across providers
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_username text, user_id uuid)
RETURNS text AS $$
DECLARE
    final_username text := base_username;
    counter integer := 1;
BEGIN
    -- Clean the base username
    final_username := regexp_replace(lower(trim(base_username)), '[^a-z0-9_]', '', 'g');

    -- Ensure minimum length and valid start character
    IF length(final_username) < 3 THEN
        final_username := 'user_' || substr(md5(user_id::text), 1, 8);
    END IF;

    -- Ensure starts with letter
    IF NOT (final_username ~ '^[a-z]') THEN
        final_username := 'u' || final_username;
    END IF;

    -- Check uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != user_id) LOOP
        counter := counter + 1;
        final_username := split_part(base_username, '_', 1) || '_' || counter;
        final_username := regexp_replace(lower(trim(final_username)), '[^a-z0-9_]', '', 'g');
    END LOOP;

    RETURN final_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update profile from auth metadata
CREATE OR REPLACE FUNCTION public.sync_profile_from_auth(user_id uuid DEFAULT NULL)
RETURNS boolean AS $$
DECLARE
    target_user_id uuid := COALESCE(user_id, auth.uid());
    auth_user record;
BEGIN
    -- Get auth user data
    SELECT * INTO auth_user FROM auth.users WHERE id = target_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found in auth.users';
    END IF;

    -- Update profile with latest auth metadata
    UPDATE public.profiles
    SET
        full_name = COALESCE(
            auth_user.raw_user_meta_data->>'full_name',
            auth_user.raw_user_meta_data->>'name',
            full_name
        ),
        avatar_url = COALESCE(
            auth_user.raw_user_meta_data->>'avatar_url',
            auth_user.raw_user_meta_data->>'picture',
            avatar_url
        ),
        metadata = auth_user.raw_user_meta_data,
        updated_at = now()
    WHERE id = target_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to create user profiles manually (for seeding or migration)
CREATE OR REPLACE FUNCTION public.admin_create_profile(
    user_id uuid,
    profile_full_name text DEFAULT NULL,
    profile_username text DEFAULT NULL,
    profile_role text DEFAULT 'user',
    profile_avatar_url text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    current_user_role text;
    final_username text;
BEGIN
    -- Check admin permissions
    current_user_role := get_my_role();
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can create user profiles';
    END IF;

    -- Validate role
    IF profile_role NOT IN ('admin', 'editor', 'user') THEN
        RAISE EXCEPTION 'Invalid role. Must be one of: admin, editor, user';
    END IF;

    -- Generate unique username if not provided
    IF profile_username IS NULL THEN
        final_username := public.generate_unique_username(
            COALESCE(profile_full_name, 'user'),
            user_id
        );
    ELSE
        final_username := profile_username;
        -- Check if username is already taken
        IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != user_id) THEN
            RAISE EXCEPTION 'Username already taken';
        END IF;
    END IF;

    -- Create or update profile
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        avatar_url,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        final_username,
        profile_full_name,
        profile_avatar_url,
        profile_role,
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        role = EXCLUDED.role,
        updated_at = now();

    -- Update JWT claims
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', profile_role)
    WHERE id = user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON FUNCTION handle_new_user IS 'Automatically creates user profile when new user signs up';
COMMENT ON FUNCTION handle_user_deleted IS 'Logs profile deletion for audit trail';
COMMENT ON FUNCTION generate_unique_username IS 'Generates unique username from base string';
COMMENT ON FUNCTION sync_profile_from_auth IS 'Syncs profile data from auth.users metadata';
COMMENT ON FUNCTION admin_create_profile IS 'Admin function to manually create or update user profiles';
