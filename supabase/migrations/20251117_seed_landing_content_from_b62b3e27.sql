-- Create tables if not exist? No, assume exist.
-- Seed hero_content
INSERT INTO public.hero_content (
  id, title, subtitle, description, stats, cta_text, cta_link, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'WildOut!',
  'Media Digital Nightlife & Event Multi-Platform',
  'Indonesia''s premier creative community connecting artists, events, and experiences. Join us in celebrating nightlife culture and creative collaborations.',
  '{"events": "500+", "members": "50K+", "partners": "100+"}'::jsonb,
  NULL,
  NULL,
  now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  stats = EXCLUDED.stats,
  cta_text = EXCLUDED.cta_text,
  cta_link = EXCLUDED.cta_link,
  updated_at = EXCLUDED.updated_at;

-- Seed about_content
INSERT INTO public.about_content (
  id, title, subtitle, founded_year, story, features, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'About WildOut!',
  'Indonesia''s leading creative community platform, connecting artists, events, and experiences since 2020. We''re more than just events – we''re a movement.',
  '2020',
  ARRAY[
    'Founded in 2020, WildOut! emerged from a simple idea: to create a platform that celebrates Indonesia''s vibrant creative culture. What started as small gatherings has grown into one of the country''s most influential creative communities.',
    'We''ve hosted over 500 events, connected more than 50,000 creative professionals, and partnered with 100+ brands to bring unforgettable experiences to our community. From intimate art exhibitions to massive music festivals, we''re dedicated to showcasing the best of Indonesia''s creative talent.',
    'Our mission is to empower artists, connect communities, and push the boundaries of what''s possible in nightlife and event culture. Join us in shaping the future of Indonesia''s creative scene.'
  ]::text[],
  '[
    {"title": "Community First", "description": "We bring together passionate creatives, artists, and event enthusiasts to build lasting connections."},
    {"title": "Unforgettable Experiences", "description": "Every event is crafted to deliver unique, memorable moments that resonate with our community."},
    {"title": "Collaborative Spirit", "description": "We partner with local and international brands to create opportunities for growth and collaboration."},
    {"title": "Creative Innovation", "description": "Pushing boundaries with cutting-edge production, technology, and artistic expression."}
  ]'::jsonb,
  now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  founded_year = EXCLUDED.founded_year,
  story = EXCLUDED.story,
  features = EXCLUDED.features,
  updated_at = EXCLUDED.updated_at;

-- Seed site_settings
INSERT INTO public.site_settings (
  id, site_name, site_description, tagline, email, phone, address, social_media, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003'::uuid,
  'WildOut!',
  'Media Digital Nightlife & Event Multi-Platform',
  'Indonesia''s premier creative community platform',
  'contact@wildoutproject.com',
  '+62 21 1234 567',
  'Jakarta, Indonesia',
  '{"instagram": "https://instagram.com/wildoutproject.com", "twitter": "https://twitter.com/wildout_id", "facebook": "https://facebook.com/wildoutproject.com", "youtube": "https://youtube.com/@wildout"}'::jsonb,
  now()
) ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  site_description = EXCLUDED.site_description,
  tagline = EXCLUDED.tagline,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  social_media = EXCLUDED.social_media,
  updated_at = EXCLUDED.updated_at;

-- Seed admin_sections (if not exist)
INSERT INTO public.admin_sections (slug, label, icon, category, order_index, description) VALUES
('home', 'Dashboard', 'LayoutDashboard', 'main', 1, 'Overview dashboard with statistics and recent activity'),
('hero', 'Hero Section', 'Sparkles', 'content', 2, 'Landing page hero section with title, subtitle, and call-to-action'),
('about', 'About Us', 'Info', 'content', 3, 'About page content including story and features'),
('events', 'Events', 'Calendar', 'content', 4, 'Manage events, categories, and event details'),
('team', 'Team', 'Users', 'content', 5, 'Team members and their information'),
('gallery', 'Gallery', 'Image', 'content', 6, 'Image gallery items and management'),
('partners', 'Partners', 'Handshake', 'content', 7, 'Partner organizations and collaborations'),
('settings', 'Settings', 'Settings', 'management', 8, 'Site-wide settings and configuration')
ON CONFLICT (slug) DO NOTHING;

-- Seed role_permissions
INSERT INTO public.role_permissions (role, section_slug, can_view, can_edit, can_publish, can_delete) VALUES
-- Admin full access
('admin', 'home', true, true, true, true),
('admin', 'hero', true, true, true, true),
('admin', 'about', true, true, true, true),
('admin', 'events', true, true, true, true),
('admin', 'team', true, true, true, true),
('admin', 'gallery', true, true, true, true),
('admin', 'partners', true, true, true, true),
('admin', 'settings', true, true, true, true),
-- Editor content access
('editor', 'home', true, false, false, false),
('editor', 'hero', true, true, true, false),
('editor', 'about', true, true, true, false),
('editor', 'events', true, true, true, false),
('editor', 'team', true, true, true, false),
('editor', 'gallery', true, true, true, false),
('editor', 'partners', true, true, true, false),
('editor', 'settings', true, false, false, false),
-- Viewer read-only
('viewer', 'home', true, false, false, false),
('viewer', 'hero', true, false, false, false),
('viewer', 'about', true, false, false, false),
('viewer', 'events', true, false, false, false),
('viewer', 'team', true, false, false, false),
('viewer', 'gallery', true, false, false, false),
('viewer', 'partners', true, false, false, false),
('viewer', 'settings', false, false, false, false)
ON CONFLICT (role, section_slug) DO NOTHING;

-- Seed section_content for key sections (home, events, etc.)
INSERT INTO public.section_content (section_id, payload, version, is_active) 
SELECT 
  s.id,
  jsonb_build_object(
    'stats', jsonb_build_object(
      'totalEvents', 0, 'upcomingEvents', 0, 'ongoingEvents', 0, 'completedEvents', 0,
      'totalTeamMembers', 0, 'activeTeamMembers', 0, 'totalGalleryImages', 0,
      'totalPartners', 0, 'activePartners', 0, 'totalAttendees', 0, 'avgAttendanceRate', 0
    ),
    'recentActivity', '[]'::jsonb,
    'charts', jsonb_build_object(
      'monthlyTrendData', '[{"month": "Jan", "events": 12, "attendees": 450}, {"month": "Feb", "events": 15, "attendees": 580}, {"month": "Mar", "events": 18, "attendees": 720}, {"month": "Apr", "events": 22, "attendees": 890}, {"month": "May", "events": 25, "attendees": 1050}, {"month": "Jun", "events": 20, "attendees": 820}]'::jsonb
    )
  ),
  1,
  true
FROM public.admin_sections s WHERE s.slug = 'home'
ON CONFLICT (section_id, version) DO UPDATE SET payload = EXCLUDED.payload, is_active = true;

-- Similar for other sections like events, team, etc. with their default payloads
-- (abbreviated for brevity, include all from script)

INSERT INTO public.section_content (section_id, payload, version, is_active) 
SELECT 
  s.id,
  jsonb_build_object(
    'eventCategories', ARRAY['music','sports','arts','food','community','other']::text[],
    'eventStatuses', ARRAY['draft','published','cancelled','archived']::text[],
    'defaultCapacity', 100,
    'maxFileSize', 5242880,
    'allowedImageTypes', ARRAY['image/jpeg','image/png','image/webp']::text[]
  ),
  1,
  true
FROM public.admin_sections s WHERE s.slug = 'events'
ON CONFLICT (section_id, version) DO UPDATE SET payload = EXCLUDED.payload, is_active = true;

-- Repeat for team, gallery, partners, settings with their respective payloads from script
-- Team
INSERT INTO public.section_content (section_id, payload, version, is_active) 
SELECT s.id, '{"memberStatuses": ["active","inactive"], "maxBioLength": 500, "maxFileSize": 2097152, "allowedImageTypes": ["image/jpeg","image/png","image/webp"], "socialPlatforms": ["linkedin","twitter","instagram","facebook"]}'::jsonb, 1, true
FROM public.admin_sections s WHERE s.slug = 'team'
ON CONFLICT (section_id, version) DO UPDATE SET payload = EXCLUDED.payload, is_active = true;

-- Gallery
INSERT INTO public.section_content (section_id, payload, version, is_active) 
SELECT s.id, '{"categories": ["event","partner","team","general"], "statuses": ["published","draft","archived"], "maxFileSize": 10485760, "allowedImageTypes": ["image/jpeg","image/png","image/webp"], "thumbnailSizes": [150,300,600], "compressionQuality": 0.8}'::jsonb, 1, true
FROM public.admin_sections s WHERE s.slug = 'gallery'
ON CONFLICT (section_id, version) DO UPDATE SET payload = EXCLUDED.payload, is_active = true;

-- Partners
INSERT INTO public.section_content (section_id, payload, version, is_active) 
SELECT s.id, '{"categories": ["venue","promoter","artist","sponsor","other"], "statuses": ["active","inactive","pending"], "maxFileSize": 2097152, "allowedImageTypes": ["image/jpeg","image/png","image/webp"], "socialPlatforms": ["website","email","phone","facebook","twitter","instagram","linkedin"]}'::jsonb, 1, true
FROM public.admin_sections s WHERE s.slug = 'partners'
ON CONFLICT (section_id, version) DO UPDATE SET payload = EXCLUDED.payload, is_active = true;

-- Settings
INSERT INTO public.section_content (section_id, payload, version, is_active) 
SELECT s.id, '{"socialPlatforms": ["facebook","twitter","instagram","linkedin","youtube","tiktok"], "contactFields": ["email","phone","address"], "validationRules": {"email": "^[^@\\\\s]+@[^@\\\\s]+\\\\.[^@\\\\s]+$", "phone": "^[+]?[\\\\d\\\\s\\\\-\\\\(\\\\)]{10,}$"}}'::jsonb, 1, true
FROM public.admin_sections s WHERE s.slug = 'settings'
ON CONFLICT (section_id, version) DO UPDATE SET payload = EXCLUDED.payload, is_active = true;

COMMENT ON TABLE public.hero_content IS 'Singleton table for landing page hero section content';
COMMENT ON TABLE public.about_content IS 'Singleton table for about page content';
COMMENT ON TABLE public.site_settings IS 'Singleton table for site-wide settings';
