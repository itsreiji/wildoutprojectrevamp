-- Seed from b62b3e27 ContentContext INITIAL data
-- Partners first (FK)

-- Partners (12)
INSERT INTO public.partners (id, name, description, website_url, logo_url, status, category, social_links, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000010001'::uuid, 'Spotify', 'Leading music streaming platform supporting independent artists and emerging talent.', 'https://spotify.com', NULL, 'active', 'music', '{"instagram": "https://instagram.com/spotify", "facebook": "https://facebook.com/Spotify", "twitter": "https://twitter.com/spotify"}'::jsonb, now(), now()),
-- ... repeat for all 12 with sequential ids partner-001 to 012
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, ... ;

-- Events (4)
INSERT INTO public.events (id, title, description, start_date, end_date, location, category, status, image_url, metadata, partner_id, partner_name, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000020001'::uuid, 'Neon Nights: Electronic Odyssey', 'Experience an unforgettable night...', '2025-11-15T21:00:00Z', '2025-11-16T04:00:00Z', 'Jakarta Convention Center', 'Music Festival', 'published', 'https://images.unsplash.com/photo-1709131482554-53117b122a35...', '{"highlights": ["International DJ lineup", ...]}'::jsonb, 'partner-001 uuid', 'Spotify', now(), now()),
-- ... for all 4 events
ON CONFLICT(id) DO UPDATE SET ... ;

-- event_artists (from events.artists arrays)
INSERT INTO public.event_artists (...) VALUES (... for each artist);

-- team_members (12)
INSERT INTO ... ;

-- gallery_items (6)
INSERT INTO ... ;
