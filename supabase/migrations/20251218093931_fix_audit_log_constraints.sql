-- Fix audit_log table to allow more actions and non-UUID record IDs
ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;

-- Change record_id from uuid to text to support emails, 'system', and other identifiers
ALTER TABLE public.audit_log ALTER COLUMN record_id TYPE text;

COMMENT ON COLUMN public.audit_log.record_id IS 'Identifier of the record being audited (UUID for tables, or text for system/auth events)';
COMMENT ON COLUMN public.audit_log.action IS 'The action performed (INSERT, UPDATE, DELETE, or custom security events)';
