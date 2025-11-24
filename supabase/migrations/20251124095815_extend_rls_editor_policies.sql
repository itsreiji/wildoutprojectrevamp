-- Extend RLS for full Editor support per openspec/specs/rls-editor-permissions/spec.md
-- Editors+ (is_editor_or_admin_via_jwt()) full CRUD content tables
-- Editor granular: events drafts, audit read-only

-- Content tables: Editors+ full CRUD
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'events', 'partners', 'team_members', 'gallery_items', 'venues', 'artists',
    'benefits_partners', 'benefits_members', 'event_artists',
    'hero_content', 'about_content', 'site_settings'
  ]::text[]
  LOOP
    -- Drop old if exists, create Editors+ policy
    EXECUTE format('DROP POLICY IF EXISTS "Editors+ manage %I" ON public.%I', table_name, table_name);
    EXECUTE format('
      CREATE POLICY "Editors+ manage %I" ON public.%I
      FOR ALL TO authenticated
      USING (is_editor_or_admin_via_jwt())
      WITH CHECK (is_editor_or_admin_via_jwt());
    ', table_name, table_name);
  END LOOP;
END $$;

-- Specific: Events - Editor drafts only (granular beyond full CRUD)
DROP POLICY IF EXISTS "editor_write_draft_events" ON public.events;
CREATE POLICY "editor_insert_draft_events" ON public.events
FOR INSERT TO authenticated
WITH CHECK (get_my_role() = 'editor' AND status = 'draft');

DROP POLICY IF EXISTS "editor_update_draft_events" ON public.events;
CREATE POLICY "editor_update_draft_events" ON public.events
FOR UPDATE TO authenticated
USING (get_my_role() = 'editor' AND status IN ('draft', 'published'))
WITH CHECK (get_my_role() = 'editor');

-- Audit log: Editors+ read-only
DROP POLICY IF EXISTS "Editors+ read audit_log" ON public.audit_log;
CREATE POLICY "Editors+ read audit_log" ON public.audit_log
FOR SELECT TO authenticated
USING (is_editor_or_admin_via_jwt());

-- Verify
COMMENT ON POLICY "Editors+ manage events" ON public.events IS 'Editors+ full CRUD per PRD role-based access';
