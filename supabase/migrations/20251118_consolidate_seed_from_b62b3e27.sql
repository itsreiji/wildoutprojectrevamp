-- Migration: 20250117_consolidate_seed_from_b62b3e27
-- Description: Consolidated seed data from commit b62b3e27dca9ccd6dd8fd58bdd6745b618e9d3f9
-- Includes: 4 events, 12 partners, 12 team members, 6 gallery items
-- Created: 2025-01-17

-- Ensure events table has metadata field for highlights and artists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.events ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
END $$;

-- Ensure gallery_items has tags field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'gallery_items' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE public.gallery_items ADD COLUMN tags text[] DEFAULT '{}';
    END IF;
END $$;

-- =============================================
-- SEED PARTNERS (12 partners from commit)
-- =============================================
INSERT INTO public.partners (id, name, description, logo_url, website_url, category, status, social_links, metadata, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Spotify', 'Leading music streaming platform supporting independent artists and emerging talent.', NULL, 'https://spotify.com', 'music', 'active', '{"instagram": "https://instagram.com/spotify", "facebook": "https://facebook.com/Spotify", "twitter": "https://twitter.com/spotify"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'Red Bull', 'Energy drink brand sponsoring extreme sports and music events worldwide.', NULL, 'https://redbull.com', 'sponsor', 'active', '{"instagram": "https://instagram.com/redbull", "facebook": "https://facebook.com/RedBull", "twitter": "https://twitter.com/redbull"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'Heineken', 'Premium beer brand known for sponsoring music festivals and cultural events.', NULL, 'https://heineken.com', 'beverage', 'active', '{"instagram": "https://instagram.com/heineken", "facebook": "https://facebook.com/Heineken", "twitter": "https://twitter.com/heineken"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'Nike', 'Global sportswear brand committed to innovation and athletic excellence.', NULL, 'https://nike.com', 'lifestyle', 'active', '{"instagram": "https://instagram.com/nike", "facebook": "https://facebook.com/nike", "twitter": "https://twitter.com/nike"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'Adidas', 'Athletic apparel and lifestyle brand', NULL, 'https://adidas.com', 'lifestyle', 'active', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000006'::uuid, 'Apple Music', 'Apple''s music streaming service featuring exclusive content and artist interviews.', NULL, 'https://apple.com/music', 'music', 'active', '{"instagram": "https://instagram.com/applemusic", "facebook": "https://facebook.com/applemusic", "twitter": "https://twitter.com/applemusic"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000007'::uuid, 'Corona', 'Premium beer brand', NULL, 'https://corona.com', 'beverage', 'active', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000008'::uuid, 'Converse', 'Lifestyle brand', NULL, 'https://converse.com', 'lifestyle', 'active', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000009'::uuid, 'Gojek', 'Indonesia''s leading ride-hailing and on-demand services platform.', NULL, 'https://gojek.com', 'technology', 'active', '{"instagram": "https://instagram.com/gojekindonesia", "facebook": "https://facebook.com/gojek", "twitter": "https://twitter.com/gojek"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000010'::uuid, 'Tokopedia', 'Indonesia''s largest e-commerce platform connecting buyers and sellers nationwide.', NULL, 'https://tokopedia.com', 'technology', 'active', '{"instagram": "https://instagram.com/tokopedia", "facebook": "https://facebook.com/tokopedia", "twitter": "https://twitter.com/tokopedia"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000011'::uuid, 'BCA', 'Bank Central Asia', NULL, 'https://bca.co.id', 'sponsor', 'active', '{"instagram": "https://instagram.com/bca", "twitter": "https://twitter.com/bca"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000012'::uuid, 'Telkomsel', 'Telecommunications provider', NULL, 'https://telkomsel.com', 'technology', 'active', '{}'::jsonb, '{}'::jsonb, now(), now())
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  social_links = EXCLUDED.social_links,
  metadata = EXCLUDED.metadata,
  updated_at = EXCLUDED.updated_at;

-- =============================================
-- SEED TEAM MEMBERS (12 members from commit)
-- =============================================
INSERT INTO public.team_members (id, name, title, bio, avatar_url, email, status, display_order, metadata, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000021'::uuid, 'Sarah Chen', 'CEO & Founder', 'Visionary leader with 10+ years experience in nightlife and entertainment industry', 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400', 'sarah@wildout.id', 'active', 1, '{"phone": "+62 812 3456 7890"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000022'::uuid, 'Michael Rodriguez', 'Creative Director', 'Award-winning creative with passion for innovative event experiences', 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400', 'michael@wildout.id', 'active', 2, '{"phone": "+62 813 7654 3210"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000023'::uuid, 'Aisha Patel', 'Marketing Director', 'Digital marketing strategist specializing in community engagement', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'aisha@wildout.id', 'active', 3, '{"phone": "+62 814 8765 4321"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000024'::uuid, 'David Kim', 'Operations Manager', 'Expert in logistics and operational excellence for large-scale events', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'david@wildout.id', 'active', 4, '{"phone": "+62 815 2468 1357"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000025'::uuid, 'Priya Sharma', 'Event Coordinator', 'Meticulous planner ensuring flawless event execution', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'priya@wildout.id', 'active', 5, '{"phone": "+62 816 9753 8642"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000026'::uuid, 'James Wilson', 'Technical Director', 'Audio-visual expert with cutting-edge production knowledge', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'james@wildout.id', 'active', 6, '{"phone": "+62 817 3698 5274"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000027'::uuid, 'Natasha Williams', 'Social Media Manager', 'Content creator building vibrant online communities', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'natasha@wildout.id', 'active', 7, '{"phone": "+62 818 7531 9864"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000028'::uuid, 'Alex Zhang', 'Sponsorship Manager', 'Building strategic partnerships with leading brands', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'alex@wildout.id', 'active', 8, '{"phone": "+62 819 8524 7136"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000029'::uuid, 'Maria Santos', 'Artist Relations', 'Connecting top talent with incredible event opportunities', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'maria@wildout.id', 'active', 9, '{"phone": "+62 820 1472 5836"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000030'::uuid, 'Ryan Thompson', 'Design Lead', 'Creating stunning visual identities for memorable events', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'ryan@wildout.id', 'active', 10, '{"phone": "+62 821 9517 3648"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000031'::uuid, 'Lily Anderson', 'Customer Experience', 'Ensuring every guest has an unforgettable experience', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'lily@wildout.id', 'active', 11, '{"phone": "+62 822 7539 5148"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000032'::uuid, 'Omar Hassan', 'Finance Manager', 'Managing financial strategy and sustainable growth', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'omar@wildout.id', 'active', 12, '{"phone": "+62 823 8642 9753"}'::jsonb, now(), now())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  metadata = EXCLUDED.metadata,
  updated_at = EXCLUDED.updated_at;

-- =============================================
-- SEED EVENTS (4 events from commit)
-- =============================================
INSERT INTO public.events (
  id, title, description, start_date, end_date, location, address, city, category, status, 
  max_attendees, current_attendees, price, currency, is_free, image_url, gallery_images_urls,
  partner_id, partner_name, metadata, tags, created_at, updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000041'::uuid,
    'Neon Nights: Electronic Odyssey',
    'Experience an unforgettable night of electronic music featuring Indonesia''s top DJs and international guest artists. Immerse yourself in cutting-edge visuals and world-class production.',
    '2025-11-15T21:00:00Z'::timestamptz,
    '2025-11-16T04:00:00Z'::timestamptz,
    'Jakarta Convention Center',
    'Jl. Gatot Subroto, Jakarta Pusat',
    'Jakarta Pusat',
    'festival',
    'published',
    5000,
    3200,
    NULL,
    'IDR',
    false,
    'https://images.unsplash.com/photo-1709131482554-53117b122a35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGxpZmUlMjBwYXJ0eSUyMGV2ZW50fGVufDF8fHx8MTc2MTgzNzA3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    '["https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800", "https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800", "https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800"]'::jsonb,
    (SELECT id FROM public.partners WHERE name = 'Spotify' LIMIT 1),
    'Spotify',
    '{"artists": [{"name": "DJ Stellar", "role": "Headliner", "image": "https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=400"}, {"name": "Luna Beats", "role": "Supporting", "image": "https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400"}, {"name": "Midnight Mix", "role": "Opening", "image": "https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400"}], "highlights": ["International DJ lineup", "State-of-the-art sound system", "3D visual mapping", "VIP lounge access", "Food & beverage vendors"], "price_range": "IDR 250K - 500K"}'::jsonb,
    ARRAY['electronic', 'festival', 'music']::text[],
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000042'::uuid,
    'Urban Art Exhibition',
    'Discover the vibrant world of Indonesian street art and contemporary visual culture. Featuring works from emerging and established artists.',
    '2025-11-20T18:00:00Z'::timestamptz,
    '2025-11-20T23:00:00Z'::timestamptz,
    'Museum MACAN',
    'Jl. Panjang No.5, Jakarta Barat',
    'Jakarta Barat',
    'exhibition',
    'published',
    800,
    450,
    NULL,
    'IDR',
    false,
    'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwbW9kZXJufGVufDF8fHx8MTc2MTc2MDA1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    '["https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800", "https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=800"]'::jsonb,
    (SELECT id FROM public.partners WHERE name = 'Nike' LIMIT 1),
    'Nike',
    '{"artists": [{"name": "Eko Nugroho", "role": "Featured Artist", "image": "https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400"}, {"name": "Wedha Abdul Rasyid", "role": "Guest Artist", "image": "https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400"}], "highlights": ["Live art performances", "Interactive installations", "Artist meet & greet", "Limited edition prints", "Complimentary drinks"], "price_range": "IDR 150K"}'::jsonb,
    ARRAY['art', 'exhibition', 'culture']::text[],
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000043'::uuid,
    'Sunset Sessions Vol. 12',
    'An intimate rooftop experience featuring acoustic performances, craft cocktails, and stunning city views as the sun sets over Jakarta.',
    '2025-11-25T17:00:00Z'::timestamptz,
    '2025-11-25T22:00:00Z'::timestamptz,
    'Cloud Lounge',
    'Jl. Jend. Sudirman, Jakarta Selatan',
    'Jakarta Selatan',
    'concert',
    'published',
    300,
    285,
    NULL,
    'IDR',
    false,
    'https://images.unsplash.com/photo-1656283384093-1e227e621fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBjcm93ZHxlbnwxfHx8fDE3NjE4MzM0MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    '["https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800", "https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800"]'::jsonb,
    (SELECT id FROM public.partners WHERE name = 'Heineken' LIMIT 1),
    'Heineken',
    '{"artists": [{"name": "Tulus", "role": "Headliner", "image": "https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=400"}, {"name": "Raisa", "role": "Special Guest", "image": "https://images.unsplash.com/photo-1709131482554-53117b122a35?w=400"}], "highlights": ["Rooftop venue with city views", "Acoustic performances", "Craft cocktail menu", "Sunset viewing deck", "Limited capacity for intimate experience"], "price_range": "IDR 200K"}'::jsonb,
    ARRAY['acoustic', 'rooftop', 'music']::text[],
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000044'::uuid,
    'Bass Rebellion: Underground Series',
    'Dive deep into the underground bass music scene with Indonesia''s finest dubstep, drum & bass, and trap artists. This is not for the faint of heart.',
    '2025-12-01T22:00:00Z'::timestamptz,
    '2025-12-02T05:00:00Z'::timestamptz,
    'The Bunker',
    'Jl. Kemang Raya, Jakarta Selatan',
    'Jakarta Selatan',
    'club',
    'published',
    1500,
    1200,
    NULL,
    'IDR',
    false,
    'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMHBlcmZvcm1hbmNlJTIwY2x1YnxlbnwxfHx8fDE3NjE4MTgwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    '["https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800", "https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800"]'::jsonb,
    (SELECT id FROM public.partners WHERE name = 'Red Bull' LIMIT 1),
    'Red Bull',
    '{"artists": [{"name": "Bass Monkey", "role": "Headliner", "image": "https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=400"}, {"name": "Subsonic", "role": "Supporting", "image": "https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400"}, {"name": "Frequency", "role": "Opening", "image": "https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400"}], "highlights": ["Underground warehouse venue", "Heavy bass sound system", "Live visuals and lasers", "Multiple stages", "After-hours access"], "price_range": "IDR 150K"}'::jsonb,
    ARRAY['bass', 'underground', 'club']::text[],
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  location = EXCLUDED.location,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  max_attendees = EXCLUDED.max_attendees,
  current_attendees = EXCLUDED.current_attendees,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  is_free = EXCLUDED.is_free,
  image_url = EXCLUDED.image_url,
  gallery_images_urls = EXCLUDED.gallery_images_urls,
  partner_id = EXCLUDED.partner_id,
  partner_name = EXCLUDED.partner_name,
  metadata = EXCLUDED.metadata,
  tags = EXCLUDED.tags,
  updated_at = EXCLUDED.updated_at;

-- =============================================
-- SEED GALLERY ITEMS (6 items from commit)
-- =============================================
INSERT INTO public.gallery_items (id, title, description, image_url, category, status, tags, metadata, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000051'::uuid, 'Neon Nights Festival', 'Neon Nights Festival', 'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800', 'event', 'published', ARRAY['festival', 'neon', 'electronic']::text[], '{"event": "Neon Nights"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000052'::uuid, 'Concert Crowd', 'Concert Crowd', 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800', 'event', 'published', ARRAY['concert', 'crowd', 'music']::text[], '{"event": "Sunset Sessions"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000053'::uuid, 'DJ Performance', 'DJ Performance', 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800', 'event', 'published', ARRAY['dj', 'performance', 'bass']::text[], '{"event": "Bass Rebellion"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000054'::uuid, 'Art Exhibition', 'Art Exhibition', 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800', 'event', 'published', ARRAY['art', 'exhibition', 'urban']::text[], '{"event": "Urban Art"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000055'::uuid, 'Creative Team', 'Creative Team', 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=800', 'team', 'published', ARRAY['team', 'creative']::text[], '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000056'::uuid, 'Brand Partnership', 'Brand Partnership', 'https://images.unsplash.com/photo-1758922801699-09d8d788f90c?w=800', 'partnership', 'published', ARRAY['partnership', 'brand']::text[], '{}'::jsonb, now(), now())
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  metadata = EXCLUDED.metadata,
  updated_at = EXCLUDED.updated_at;

