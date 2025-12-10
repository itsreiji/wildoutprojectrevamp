-- Phase 3: Final Cleanup for Security and Performance

-- 1. Fix Mutable Search Path
ALTER FUNCTION public.get_past_events_week() SET search_path = public;
ALTER FUNCTION public.sync_event_denorm_data() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Fix RLS InitPlan Performance

-- event_artists
DROP POLICY IF EXISTS "authenticated_read_event_artists" ON public.event_artists;
CREATE POLICY "authenticated_read_event_artists" ON public.event_artists
FOR SELECT TO public
USING ((select auth.role()) = 'authenticated');

-- user_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
FOR SELECT TO public
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
FOR ALL TO public
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
CREATE POLICY "Admins can view all sessions" ON public.user_sessions
FOR SELECT TO public
USING (
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
  ))
);
