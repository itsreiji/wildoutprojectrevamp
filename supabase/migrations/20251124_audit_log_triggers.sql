-- Audit log triggers for Phase 1 Quick Win Item 15
-- Creates generic audit_log_trigger function and applies AFTER INSERT/UPDATE/DELETE triggers
-- to key tables: events, partners, gallery_items, team_members, profiles
-- Logs: table_name, record_id (uuid), action (INSERT/UPDATE/DELETE), old_data/new_data (jsonb), user_id (uuid from auth.uid()), created_at (default now())

CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, user_id)
    VALUES (TG_RELNAME::text, OLD.id, 'DELETE', row_to_json(OLD)::jsonb, auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_RELNAME::text, NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, record_id, action, new_data, user_id)
    VALUES (TG_RELNAME::text, NEW.id, 'INSERT', row_to_json(NEW)::jsonb, auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Events table trigger (includes recent columns: partner_id, status, dates)
CREATE TRIGGER audit_log_events
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- Partners table trigger (includes sponsorship_level)
CREATE TRIGGER audit_log_partners
  AFTER INSERT OR UPDATE OR DELETE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- Gallery items table trigger (includes event_id)
CREATE TRIGGER audit_log_gallery_items
  AFTER INSERT OR UPDATE OR DELETE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- Team members table trigger
CREATE TRIGGER audit_log_team_members
  AFTER INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

-- Profiles table trigger (logs role changes, etc.; careful with auth triggers)
CREATE TRIGGER audit_log_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();