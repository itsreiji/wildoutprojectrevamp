-- Migration: 20251115_content_tables
-- Description: Add tables for site-wide content (hero, about, settings) to enable admin dashboard persistence and landing page sync
-- Created: 2025-11-15

-- =============================================
-- SITE-WIDE CONTENT TABLES
-- =============================================

-- Hero content table (singleton - only one row should exist)
CREATE TABLE public.hero_content (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL DEFAULT 'WildOut!',
    subtitle text DEFAULT 'Media Digital Nightlife & Event Multi-Platform',
    description text DEFAULT 'Indonesia''s premier creative community connecting artists, events, and experiences.',
    stats jsonb DEFAULT '{"events": "500+", "members": "50K+", "partners": "100+"}'::jsonb,
    cta_text text DEFAULT 'Explore Events',
    cta_link text DEFAULT '/events',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- About content table (singleton - only one row should exist)
CREATE TABLE public.about_content (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL DEFAULT 'About WildOut!',
    subtitle text DEFAULT 'Indonesia''s leading creative community platform, connecting artists, events, and experiences since 2020.',
    founded_year text DEFAULT '2020',
    story text[] DEFAULT ARRAY[
        'Founded in 2020, WildOut! celebrates Indonesia''s creative culture.',
        'We host community-driven events that bring artists, venues, and sponsors together.'
    ],
    features jsonb DEFAULT '[
        {"title": "Community First", "description": "We build lasting connections."},
        {"title": "Unforgettable Experiences", "description": "Every event is crafted to be memorable."}
    ]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Site settings table (singleton - only one row should exist)
CREATE TABLE public.site_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    site_name text NOT NULL DEFAULT 'WildOut!',
    site_description text DEFAULT 'Media Digital Nightlife & Event Multi-Platform',
    tagline text DEFAULT 'Indonesia''s premier creative community platform',
    email text DEFAULT 'contact@wildout.id',
    phone text DEFAULT '+62 21 1234 567',
    address text DEFAULT 'Jakarta, Indonesia',
    social_media jsonb DEFAULT '{
        "instagram": "https://instagram.com/wildout.id",
        "twitter": "https://twitter.com/wildout_id",
        "facebook": "https://facebook.com/wildout.id",
        "youtube": "https://youtube.com/@wildout"
    }'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Content tables are singletons, so we don't need complex indexes
-- But we'll add updated_at indexes for potential admin queries
CREATE INDEX idx_hero_content_updated_at ON public.hero_content(updated_at DESC);
CREATE INDEX idx_about_content_updated_at ON public.about_content(updated_at DESC);
CREATE INDEX idx_site_settings_updated_at ON public.site_settings(updated_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all content tables
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for published content (landing page)
CREATE POLICY "Public read access for hero content" ON public.hero_content
    FOR SELECT USING (true);

CREATE POLICY "Public read access for about content" ON public.about_content
    FOR SELECT USING (true);

CREATE POLICY "Public read access for site settings" ON public.site_settings
    FOR SELECT USING (true);

-- Admin write access (authenticated users with admin role)
CREATE POLICY "Admin write access for hero content" ON public.hero_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admin write access for about content" ON public.about_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admin write access for site settings" ON public.site_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- FUNCTIONS FOR CONTENT MANAGEMENT
-- =============================================

-- Function to get or create singleton hero content
CREATE OR REPLACE FUNCTION get_hero_content()
RETURNS public.hero_content AS $$
DECLARE
    content_record public.hero_content;
BEGIN
    -- Try to get existing record
    SELECT * INTO content_record FROM public.hero_content LIMIT 1;

    -- If no record exists, create default one
    IF content_record IS NULL THEN
        INSERT INTO public.hero_content DEFAULT VALUES
        RETURNING * INTO content_record;
    END IF;

    RETURN content_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create singleton about content
CREATE OR REPLACE FUNCTION get_about_content()
RETURNS public.about_content AS $$
DECLARE
    content_record public.about_content;
BEGIN
    -- Try to get existing record
    SELECT * INTO content_record FROM public.about_content LIMIT 1;

    -- If no record exists, create default one
    IF content_record IS NULL THEN
        INSERT INTO public.about_content DEFAULT VALUES
        RETURNING * INTO content_record;
    END IF;

    RETURN content_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create singleton site settings
CREATE OR REPLACE FUNCTION get_site_settings()
RETURNS public.site_settings AS $$
DECLARE
    settings_record public.site_settings;
BEGIN
    -- Try to get existing record
    SELECT * INTO settings_record FROM public.site_settings LIMIT 1;

    -- If no record exists, create default one
    IF settings_record IS NULL THEN
        INSERT INTO public.site_settings DEFAULT VALUES
        RETURNING * INTO settings_record;
    END IF;

    RETURN settings_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to content tables
CREATE TRIGGER update_hero_content_updated_at
    BEFORE UPDATE ON public.hero_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at
    BEFORE UPDATE ON public.about_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.hero_content IS 'Singleton table for landing page hero section content';
COMMENT ON TABLE public.about_content IS 'Singleton table for landing page about section content';
COMMENT ON TABLE public.site_settings IS 'Singleton table for site-wide settings and contact information';

COMMENT ON FUNCTION get_hero_content() IS 'Gets the singleton hero content record, creating default if none exists';
COMMENT ON FUNCTION get_about_content() IS 'Gets the singleton about content record, creating default if none exists';
COMMENT ON FUNCTION get_site_settings() IS 'Gets the singleton site settings record, creating default if none exists';
