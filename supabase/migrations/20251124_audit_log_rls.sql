-- RLS for audit_log table: Editors+ (admin/editor) full SELECT access
-- Enables RLS and creates policy using is_editor_or_admin_via_jwt()
-- Per specs/rls-editor-permissions/spec.md and PRD requirements

-- Enable RLS (idempotent if already enabled)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any (e.g., "recent" for editor)
DROP POLICY IF EXISTS "Editors read recent audit_log" ON public.audit_log;
DROP POLICY IF EXISTS "Editors+ read audit_log" ON public.audit_log;

-- Editors+ full read access (no time limit)
CREATE POLICY "Editors+ read audit_log" ON public.audit_log
FOR SELECT TO authenticated
USING (is_editor_or_admin_via_jwt());

-- No INSERT/UPDATE/DELETE policies needed (triggers handle logging automatically)
-- Members/public: no access (default deny)