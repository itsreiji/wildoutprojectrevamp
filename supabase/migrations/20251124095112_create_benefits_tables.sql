-- Create benefits tables (benefits_partners, benefits_members) per PRD discovery
-- Junction-like: benefits for partners/members, with descriptions/tiers

-- benefits_partners: partner benefits by sponsorship_level
CREATE TABLE IF NOT EXISTS public.benefits_partners (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  benefit text NOT NULL,
  sponsorship_level text CHECK (sponsorship_level IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- benefits_members: member/user benefits (e.g., loyalty tiers)
CREATE TABLE IF NOT EXISTS public.benefits_members (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  benefit text NOT NULL,
  tier text DEFAULT 'basic' CHECK (tier IN ('basic', 'silver', 'gold', 'vip')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.benefits_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits_members ENABLE ROW LEVEL SECURITY;

-- Editors+ CRUD
CREATE POLICY "Editors+ manage benefits_partners" ON public.benefits_partners
FOR ALL TO authenticated USING (is_editor_or_admin_via_jwt()) WITH CHECK (is_editor_or_admin_via_jwt());

CREATE POLICY "Editors+ manage benefits_members" ON public.benefits_members
FOR ALL TO authenticated USING (is_editor_or_admin_via_jwt()) WITH CHECK (is_editor_or_admin_via_jwt());

-- Public read active partner benefits
CREATE POLICY "Public read active partner benefits" ON public.benefits_partners
FOR SELECT TO public USING (is_active = true);

-- Indexes
CREATE INDEX idx_benefits_partners_partner_id ON public.benefits_partners (partner_id);
CREATE INDEX idx_benefits_partners_level ON public.benefits_partners (sponsorship_level);
CREATE INDEX idx_benefits_members_profile_id ON public.benefits_members (profile_id);

-- updated_at triggers (reuse if exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ language plpgsql;

CREATE TRIGGER update_benefits_partners_updated_at BEFORE UPDATE ON public.benefits_partners FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_benefits_members_updated_at BEFORE UPDATE ON public.benefits_members FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
