-- Phase 4: Final Zero-Residue Cleanup

-- 1. Fix Mutable Search Path
ALTER FUNCTION public.admin_force_logout_user(uuid) SET search_path = public;
ALTER FUNCTION public.audit_trigger_function() SET search_path = public;

-- 2. Fix RLS InitPlan Performance for Profiles

-- Users read own profile
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
FOR SELECT TO public
USING ((select auth.uid()) = id);

-- users_read_own_profile (duplicate?)
DROP POLICY IF EXISTS "users_read_own_profile" ON public.profiles;
CREATE POLICY "users_read_own_profile" ON public.profiles
FOR SELECT TO public
USING ((select auth.uid()) = id);

-- users_update_own_profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile" ON public.profiles
FOR UPDATE TO public
USING ((select auth.uid()) = id)
WITH CHECK (
  (select auth.uid()) = id 
  AND 
  role = (SELECT role FROM profiles WHERE id = (select auth.uid()))
);
