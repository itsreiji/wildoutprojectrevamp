-- Fix Security: Set views to security_invoker
ALTER VIEW public.public_events SET (security_invoker = true);
ALTER VIEW public.database_performance SET (security_invoker = true);
ALTER VIEW public.event_statistics SET (security_invoker = true);

-- Fix Security: Set search_path for SECURITY DEFINER function
ALTER FUNCTION public.generate_unique_username(text, uuid) SET search_path = public;

-- Fix Performance: Optimize RLS policies to avoid repetitive auth calls
DROP POLICY IF EXISTS "partner_manage_own_events" ON "public"."events";
CREATE POLICY "partner_manage_own_events" ON "public"."events"
AS PERMISSIVE FOR ALL
TO public
USING (
  (is_authenticated_user() AND (partner_id IN ( SELECT partners.id
   FROM partners
  WHERE ((partners.contact_email = ((select auth.jwt()) ->> 'email'::text)) AND (partners.status = 'active'::text)))))
)
WITH CHECK (
  (is_authenticated_user() AND (partner_id IN ( SELECT partners.id
   FROM partners
  WHERE ((partners.contact_email = ((select auth.jwt()) ->> 'email'::text)) AND (partners.status = 'active'::text)))) AND (status = ANY (ARRAY['draft'::text, 'published'::text])))
);

DROP POLICY IF EXISTS "partner_update_own_info" ON "public"."partners";
CREATE POLICY "partner_update_own_info" ON "public"."partners"
AS PERMISSIVE FOR UPDATE
TO public
USING (
  (is_authenticated_user() AND (contact_email = (( SELECT au.email
   FROM auth.users au
  WHERE (au.id = (select auth.uid()))))::text))
)
WITH CHECK (
  (is_authenticated_user() AND (contact_email = (( SELECT au.email
   FROM auth.users au
  WHERE (au.id = (select auth.uid()))))::text) AND (status = ANY (ARRAY['active'::text, 'inactive'::text])))
);
