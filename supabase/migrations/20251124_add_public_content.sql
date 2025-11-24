-- Migration: Add public_content singleton table for hero/about/settings
-- Per OpenSpec update-public-admin-content-sync

-- Create table
CREATE TABLE IF NOT EXISTS public.public_content (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  section text NOT NULL UNIQUE CHECK (section IN ('hero', 'about', 'settings')),
  data jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.public_content ENABLE ROW LEVEL SECURITY;

-- Editors+ full CRUD
CREATE POLICY "Editors+ manage public_content" ON public.public_content
FOR ALL TO authenticated
USING (is_editor_or_admin_via_jwt())
WITH CHECK (is_editor_or_admin_via_jwt());

-- Public read all
CREATE POLICY "Public read public_content" ON public.public_content
FOR SELECT TO public USING (true);

-- Indexes
CREATE INDEX idx_public_content_section ON public.public_content (section);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql SECURITY DEFINER;

CREATE TRIGGER update_public_content_updated_at
BEFORE UPDATE ON public.public_content
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
