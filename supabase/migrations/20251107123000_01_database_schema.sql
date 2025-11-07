-- Migration: 01_database_schema
-- Description: Core database schema with 3NF normalization and strategic denormalization
-- Created: 2025-11-07

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Events table (3NF with strategic denormalization)
CREATE TABLE public.events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    description text,
    short_description text,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    location text,
    address text,
    city text,
    state text,
    zip_code text,
    country text DEFAULT 'USA',
    latitude numeric,
    longitude numeric,
    category text NOT NULL CHECK (category IN ('music', 'sports', 'arts', 'food', 'community', 'other')),
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'archived')),
    max_attendees integer,
    current_attendees integer DEFAULT 0,
    price decimal(10,2),
    currency text DEFAULT 'USD',
    is_free boolean DEFAULT false,
    is_virtual boolean DEFAULT false,
    virtual_link text,
    contact_email text,
    contact_phone text,
    website_url text,
    social_links jsonb DEFAULT '{}',
    image_url text,
    gallery_images_urls jsonb DEFAULT '[]',
    tags text[] DEFAULT '{}',
    partner_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Strategic denormalization for performance
    partner_name text,
    partner_logo_url text,

    -- Constraints
    CONSTRAINT events_valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT events_price_check CHECK (
        (is_free = true AND price IS NULL) OR
        (is_free = false AND price >= 0)
    ),
    CONSTRAINT events_max_attendees_check CHECK (
        max_attendees IS NULL OR max_attendees > 0
    ),
    CONSTRAINT events_current_attendees_check CHECK (
        current_attendees >= 0 AND
        (max_attendees IS NULL OR current_attendees <= max_attendees)
    )
);

-- Partners table
CREATE TABLE public.partners (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    logo_url text,
    website_url text,
    contact_email text,
    contact_phone text,
    address text,
    city text,
    state text,
    zip_code text,
    country text DEFAULT 'USA',
    latitude numeric,
    longitude numeric,
    category text NOT NULL CHECK (category IN ('venue', 'promoter', 'artist', 'sponsor', 'other')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    social_links jsonb DEFAULT '{}',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    title text,
    bio text,
    avatar_url text,
    email text,
    linkedin_url text,
    twitter_handle text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    display_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Gallery items table
CREATE TABLE public.gallery_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text,
    description text,
    image_url text NOT NULL,
    thumbnail_url text,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
    partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
    category text NOT NULL DEFAULT 'general' CHECK (category IN ('event', 'partner', 'team', 'general')),
    status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    display_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Ensure at least one relationship exists
    CONSTRAINT gallery_item_relationship_check CHECK (
        event_id IS NOT NULL OR partner_id IS NOT NULL
    )
);

-- Foreign key constraints
ALTER TABLE public.events
ADD CONSTRAINT fk_events_partner
FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;

-- Advanced Indexing Strategy

-- Foreign key indexes (mandatory for performance)
CREATE INDEX idx_events_partner_id ON public.events(partner_id);
CREATE INDEX idx_gallery_items_event_id ON public.gallery_items(event_id);
CREATE INDEX idx_gallery_items_partner_id ON public.gallery_items(partner_id);

-- WHERE clause optimization indexes
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_status ON public.events(status) WHERE status = 'published';
CREATE INDEX idx_events_start_date ON public.events(start_date DESC);
CREATE INDEX idx_events_end_date ON public.events(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX idx_events_is_virtual ON public.events(is_virtual) WHERE is_virtual = true;
CREATE INDEX idx_events_price ON public.events(price) WHERE price > 0;

CREATE INDEX idx_partners_category ON public.partners(category);
CREATE INDEX idx_partners_status ON public.partners(status) WHERE status = 'active';

CREATE INDEX idx_team_members_status ON public.team_members(status) WHERE status = 'active';
CREATE INDEX idx_team_members_display_order ON public.team_members(display_order);

CREATE INDEX idx_gallery_items_category ON public.gallery_items(category);
CREATE INDEX idx_gallery_items_status ON public.gallery_items(status) WHERE status = 'published';

-- Full-text search with pg_trgm
CREATE INDEX idx_events_search ON public.events USING gin (
    (title || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, ''))
    gin_trgm_ops
);

-- Composite indexes for common queries
CREATE INDEX idx_events_category_status_date ON public.events(category, status, start_date DESC);
CREATE INDEX idx_events_location ON public.events(city, state) WHERE city IS NOT NULL AND state IS NOT NULL;
CREATE INDEX idx_events_price_category ON public.events(price, category) WHERE price > 0;

-- Partial indexes for active data
CREATE INDEX idx_partners_active_location ON public.partners(city, state) WHERE status = 'active';

-- JSONB indexes for metadata queries
CREATE INDEX idx_events_social_links ON public.events USING gin(social_links);
CREATE INDEX idx_events_tags ON public.events USING gin(tags);
CREATE INDEX idx_partners_metadata ON public.partners USING gin(metadata);

-- Database Views and Functions

-- Public events view (simplified for public queries)
CREATE VIEW public_events AS
SELECT
    id,
    title,
    short_description,
    start_date,
    end_date,
    location,
    city,
    state,
    category,
    status,
    price,
    currency,
    is_free,
    is_virtual,
    virtual_link,
    image_url,
    partner_name,
    partner_logo_url,
    current_attendees,
    max_attendees,
    tags,
    created_at
FROM public.events
WHERE status = 'published'
ORDER BY start_date ASC;

-- Partner events view
CREATE VIEW partner_events AS
SELECT
    e.id,
    e.title,
    e.start_date,
    e.end_date,
    e.status,
    e.current_attendees,
    e.max_attendees,
    e.price,
    e.is_free,
    e.category,
    e.location,
    e.city,
    e.state,
    p.name as partner_name,
    p.logo_url as partner_logo_url
FROM public.events e
JOIN public.partners p ON e.partner_id = p.id
WHERE e.status IN ('published', 'draft')
ORDER BY e.start_date ASC;

-- Event statistics view
CREATE VIEW event_statistics AS
SELECT
    DATE_TRUNC('month', start_date) as month,
    category,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE status = 'published') as published_events,
    AVG(price) FILTER (WHERE price > 0) as avg_price,
    SUM(current_attendees) as total_attendees
FROM public.events
WHERE start_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', start_date), category
ORDER BY month DESC, category;

-- RPC Functions for complex operations

-- Function to get events by location (with distance calculation if lat/lng provided)
CREATE OR REPLACE FUNCTION get_events_near_location(
    user_lat numeric DEFAULT NULL,
    user_lng numeric DEFAULT NULL,
    radius_km numeric DEFAULT 50,
    limit_count integer DEFAULT 50
)
RETURNS TABLE (
    id uuid,
    title text,
    start_date timestamptz,
    location text,
    distance_km numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.title,
        e.start_date,
        e.location,
        CASE
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND e.latitude IS NOT NULL AND e.longitude IS NOT NULL
            THEN (6371 * acos(cos(radians(user_lat)) * cos(radians(e.latitude)) * cos(radians(user_lng - e.longitude)) + sin(radians(user_lat)) * sin(radians(e.latitude))))
            ELSE NULL
        END as distance_km
    FROM public.events e
    WHERE e.status = 'published'
        AND e.start_date >= CURRENT_TIMESTAMP
        AND (user_lat IS NULL OR user_lng IS NULL OR
             (6371 * acos(cos(radians(user_lat)) * cos(radians(e.latitude)) * cos(radians(user_lng - e.longitude)) + sin(radians(user_lat)) * sin(radians(e.latitude)))) <= radius_km)
    ORDER BY
        CASE WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
            (6371 * acos(cos(radians(user_lat)) * cos(radians(e.latitude)) * cos(radians(user_lng - e.longitude)) + sin(radians(user_lat)) * sin(radians(e.latitude))))
        ELSE e.start_date END ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update event attendance
CREATE OR REPLACE FUNCTION update_event_attendance(
    event_id uuid,
    increment boolean DEFAULT true
)
RETURNS integer AS $$
DECLARE
    current_count integer;
    max_count integer;
BEGIN
    SELECT current_attendees, max_attendees
    INTO current_count, max_count
    FROM public.events
    WHERE id = event_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;

    IF increment THEN
        IF max_count IS NOT NULL AND current_count >= max_count THEN
            RAISE EXCEPTION 'Event is at maximum capacity';
        END IF;
        current_count := current_count + 1;
    ELSE
        IF current_count > 0 THEN
            current_count := current_count - 1;
        END IF;
    END IF;

    UPDATE public.events
    SET current_attendees = current_count,
        updated_at = now()
    WHERE id = event_id;

    RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Materialized views for analytics
CREATE MATERIALIZED VIEW monthly_event_stats AS
SELECT
    DATE_TRUNC('month', start_date) as month,
    category,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE status = 'published') as published_events,
    AVG(price) FILTER (WHERE price > 0) as avg_price,
    SUM(current_attendees) as total_attendees,
    MAX(created_at) as last_updated
FROM public.events
GROUP BY DATE_TRUNC('month', start_date), category
ORDER BY month DESC, category;

-- Create index on materialized view
CREATE INDEX idx_monthly_event_stats_month ON monthly_event_stats(month DESC);
CREATE INDEX idx_monthly_event_stats_category ON monthly_event_stats(category);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_monthly_event_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_event_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.events IS 'Core events table with 3NF normalization and strategic denormalization for performance';
COMMENT ON TABLE public.partners IS 'Partner organizations that host or sponsor events';
COMMENT ON TABLE public.team_members IS 'Team members displayed on about page';
COMMENT ON TABLE public.gallery_items IS 'Image gallery items associated with events or partners';

COMMENT ON VIEW public_events IS 'Public interface for published events with simplified schema';
COMMENT ON VIEW partner_events IS 'Events grouped by partner for management interface';
COMMENT ON VIEW event_statistics IS 'Monthly statistics for events by category';

COMMENT ON FUNCTION get_events_near_location IS 'Find events within radius of coordinates using Haversine formula';
COMMENT ON FUNCTION update_event_attendance IS 'Safely increment/decrement event attendance with capacity checks';
COMMENT ON FUNCTION refresh_monthly_event_stats IS 'Refresh materialized view for monthly event statistics';
