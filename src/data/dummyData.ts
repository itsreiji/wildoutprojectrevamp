import { Database } from '../supabase/types';

// =============================================
// DUMMY DATA FOR DEVELOPMENT & TESTING
// =============================================
// This file contains realistic sample data that matches the Supabase database schema
// Use this to populate your database for testing or development purposes

export const DUMMY_EVENTS: Database['public']['Tables']['events']['Insert'][] = [
  {
    title: 'Neon Nights Festival',
    description: 'An electrifying night of electronic music featuring top DJs from around the world. Experience immersive visuals, cutting-edge sound design, and unforgettable moments in Jakarta\'s premier nightlife venue.',
    start_date: '2025-12-01T22:00:00Z',
    end_date: '2025-12-02T06:00:00Z',
    location: 'The Warehouse, Jakarta Selatan',
    category: 'Festival',
    status: 'upcoming',
    max_attendees: 2000,
    website_url: 'https://wildoutproject.com/events/neon-nights',
    partner_id: 'partner-001',
    partner_name: 'Red Bull',
    metadata: {
      price_range: 'IDR 250K - 500K',
      ticket_url: 'https://wildoutproject.com/events/neon-nights',
      highlights: [
        'International DJ lineup',
        '360-degree LED installations',
        'Multiple performance stages',
        'VIP lounge access',
        'After-party until dawn'
      ],
      requirements: 'Valid ID required, 18+ only',
      accessibility: 'Wheelchair accessible, sign language interpretation available'
    }
  },
  {
    title: 'Sunset Sessions: Acoustic Vibes',
    description: 'Intimate acoustic performances in the golden hour. Join us for an evening of soulful music, craft cocktails, and breathtaking sunset views over Jakarta Bay.',
    start_date: '2025-11-20T16:00:00Z',
    end_date: '2025-11-20T20:00:00Z',
    location: 'Sky Garden Rooftop, Jakarta Pusat',
    category: 'Concert',
    status: 'upcoming',
    max_attendees: 300,
    website_url: 'https://wildoutproject.com/events/sunset-sessions',
    partner_id: 'partner-002',
    partner_name: 'Spotify',
    metadata: {
      price_range: 'IDR 150K - 300K',
      ticket_url: 'https://wildoutproject.com/events/sunset-sessions',
      highlights: [
        'Rooftop venue with panoramic views',
        'Acoustic singer-songwriter performances',
        'Craft cocktail bar',
        'Sunset photography session',
        'VIP meet & greet'
      ],
      requirements: 'Smart casual attire',
      accessibility: 'Elevator access available'
    }
  },
  {
    title: 'Urban Art Exhibition: Street to Canvas',
    description: 'A groundbreaking exhibition showcasing the evolution of street art into contemporary fine art. Featuring works from Indonesia\'s most influential street artists alongside international pieces.',
    start_date: '2025-11-15T10:00:00Z',
    end_date: '2025-11-17T18:00:00Z',
    location: 'National Gallery of Art, Jakarta',
    category: 'Exhibition',
    status: 'ongoing',
    max_attendees: 500,
    website_url: 'https://wildoutproject.com/events/urban-art',
    partner_id: 'partner-003',
    partner_name: 'Nike',
    metadata: {
      price_range: 'IDR 50K - 100K',
      ticket_url: 'https://wildoutproject.com/events/urban-art',
      highlights: [
        'Interactive art installations',
        'Artist talks and workshops',
        'Live graffiti demonstrations',
        'Merchandise shop',
        'Photography permitted'
      ],
      requirements: 'Guided tour available in English and Bahasa',
      accessibility: 'Fully accessible venue'
    }
  },
  {
    title: 'Bass Rebellion: Underground Series',
    description: 'Dive deep into underground bass music scene with Indonesia\'s finest dubstep, drum & bass, and trap artists. This is not for the faint of heart.',
    start_date: '2025-12-15T23:00:00Z',
    end_date: '2025-12-16T08:00:00Z',
    location: 'The Bunker, Jakarta Utara',
    category: 'Club Night',
    status: 'upcoming',
    max_attendees: 1500,
    website_url: 'https://wildoutproject.com/events/bass-rebellion',
    partner_id: 'partner-004',
    partner_name: 'Heineken',
    metadata: {
      price_range: 'IDR 150K - 250K',
      ticket_url: 'https://wildoutproject.com/events/bass-rebellion',
      highlights: [
        'Underground warehouse venue',
        'Heavy bass sound system',
        'Live visuals and lasers',
        'Multiple stages',
        'After-hours access'
      ],
      requirements: '18+ only, no re-entry policy',
      accessibility: 'Limited accessibility, contact venue for assistance'
    }
  },
  {
    title: 'Creative Industry Summit 2025',
    description: 'Indonesia\'s premier gathering of creative industry leaders, featuring keynote speeches, panel discussions, and networking opportunities. Join 500+ professionals shaping the future of creative industries.',
    start_date: '2025-11-25T09:00:00Z',
    end_date: '2025-11-26T17:00:00Z',
    location: 'Jakarta Convention Center',
    category: 'Conference',
    status: 'upcoming',
    max_attendees: 800,
    website_url: 'https://wildoutproject.com/events/creative-summit',
    partner_id: 'partner-005',
    partner_name: 'Google',
    metadata: {
      price_range: 'IDR 500K - 1.5M',
      ticket_url: 'https://wildoutproject.com/events/creative-summit',
      highlights: [
        'Keynote speeches from industry leaders',
        'Interactive workshops',
        'Networking lounge',
        'Startup pitch competition',
        'Exclusive after-party'
      ],
      requirements: 'Business attire recommended',
      accessibility: 'Full accessibility services available'
    }
  },
  {
    title: 'Jazz Under the Stars',
    description: 'An elegant evening of smooth jazz performances featuring both local and international artists. Enjoy fine dining and premium beverages under the stars.',
    start_date: '2025-12-05T19:00:00Z',
    end_date: '2025-12-05T23:00:00Z',
    location: 'Plaza Indonesia, Jakarta Pusat',
    category: 'Concert',
    status: 'upcoming',
    max_attendees: 400,
    website_url: 'https://wildoutproject.com/events/jazz-stars',
    partner_id: 'partner-006',
    partner_name: 'Apple Music',
    metadata: {
      price_range: 'IDR 300K - 750K',
      ticket_url: 'https://wildoutproject.com/events/jazz-stars',
      highlights: [
        'Outdoor concert venue',
        'Premium dining options',
        'Wine and cocktail pairings',
        'Jazz legend performances',
        'VIP seating with table service'
      ],
      requirements: 'Smart casual attire',
      accessibility: 'Outdoor venue, weather permitting'
    }
  }
];

// Note: event_artists table may not exist in the database schema
// This is a placeholder type - adjust based on your actual schema
export const DUMMY_EVENT_ARTISTS: Array<{
  event_id: string;
  artist_name: string;
  role: string;
  performance_time: string;
}> = [
  // Neon Nights Festival artists
  { event_id: 'event-001', artist_name: 'DJ Shadow', role: 'Headliner', performance_time: '2025-12-01T22:00:00Z' },
  { event_id: 'event-001', artist_name: 'Maya', role: 'Supporting', performance_time: '2025-12-02T00:00:00Z' },
  { event_id: 'event-001', artist_name: 'Bass Drop', role: 'Opening', performance_time: '2025-12-01T23:00:00Z' },

  // Sunset Sessions artists
  { event_id: 'event-002', artist_name: 'Sarah Acoustic', role: 'Headliner', performance_time: '2025-11-20T17:00:00Z' },
  { event_id: 'event-002', artist_name: 'The Melodies', role: 'Supporting', performance_time: '2025-11-20T18:30:00Z' },

  // Urban Art Exhibition - no specific artists

  // Bass Rebellion artists
  { event_id: 'event-004', artist_name: 'Bass Monkey', role: 'Headliner', performance_time: '2025-12-15T23:00:00Z' },
  { event_id: 'event-004', artist_name: 'Subsonic', role: 'Supporting', performance_time: '2025-12-16T01:00:00Z' },
  { event_id: 'event-004', artist_name: 'Frequency', role: 'Opening', performance_time: '2025-12-16T02:00:00Z' },

  // Creative Industry Summit speakers
  { event_id: 'event-005', artist_name: 'Dr. Creative Innovation', role: 'Keynote Speaker', performance_time: '2025-11-25T10:00:00Z' },
  { event_id: 'event-005', artist_name: 'Tech Entrepreneur', role: 'Panelist', performance_time: '2025-11-25T14:00:00Z' },

  // Jazz Under the Stars artists
  { event_id: 'event-006', artist_name: 'Miles Modern', role: 'Headliner', performance_time: '2025-12-05T20:00:00Z' },
  { event_id: 'event-006', artist_name: 'Smooth Collective', role: 'Supporting', performance_time: '2025-12-05T21:00:00Z' }
];

export const DUMMY_TEAM_MEMBERS: Database['public']['Tables']['team_members']['Insert'][] = [
  {
    name: 'Sarah Chen',
    title: 'CEO & Founder',
    email: 'sarah@wildoutproject.com',
    bio: 'Visionary leader with 10+ years experience in nightlife and entertainment industry. Founded WildOut! in 2020 with a mission to create unforgettable experiences.',
    avatar_url: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400',
    status: 'active',
    linkedin_url: 'https://linkedin.com/in/sarahchen',
    twitter_handle: '@sarahchen_wildout'
  },
  {
    name: 'Michael Rodriguez',
    title: 'Creative Director',
    email: 'michael@wildoutproject.com',
    bio: 'Award-winning creative with passion for innovative event experiences. Leads our design and creative strategy across all WildOut! productions.',
    avatar_url: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400',
    status: 'active',
    linkedin_url: 'https://linkedin.com/in/michaelrodriguez',
    twitter_handle: '@michaelrodriguez_creative'
  },
  {
    name: 'Aisha Patel',
    title: 'Marketing Director',
    email: 'aisha@wildoutproject.com',
    bio: 'Digital marketing strategist specializing in community engagement. Grew our social media following to 100K+ through authentic storytelling.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    status: 'active',
    linkedin_url: 'https://linkedin.com/in/aishapatel',
    twitter_handle: '@aishapatel_marketing'
  },
  {
    name: 'David Kim',
    title: 'Operations Manager',
    email: 'david@wildoutproject.com',
    bio: 'Expert in logistics and operational excellence for large-scale events. Ensures every WildOut! event runs flawlessly from planning to execution.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    status: 'active',
    linkedin_url: 'https://linkedin.com/in/davidkim',
    twitter_handle: '@davidkim_ops'
  },
  {
    name: 'Priya Sharma',
    title: 'Event Coordinator',
    email: 'priya@wildoutproject.com',
    bio: 'Meticulous planner ensuring flawless event execution. Coordinates with artists, venues, and teams to deliver exceptional experiences.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    status: 'active',
    linkedin_url: 'https://linkedin.com/in/priyasharma',
    twitter_handle: '@priyasharma_events'
  },
  {
    name: 'James Wilson',
    title: 'Technical Director',
    email: 'james@wildoutproject.com',
    bio: 'Audio-visual expert with cutting-edge production knowledge. Designs immersive experiences using the latest technology and lighting systems.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    status: 'active',
    linkedin_url: 'https://linkedin.com/in/jameswilson',
    twitter_handle: '@jameswilson_tech'
  },
  {
    name: 'Natasha Williams',
    title: 'Social Media Manager',
    email: 'natasha@wildoutproject.com',
    bio: 'Content creator building vibrant online communities. Manages our social media presence and engages with our creative audience worldwide.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    status: 'active',
    linkedin_url: 'https://linkedin.com/in/natashawilliams',
    twitter_handle: '@natashawilliams_social'
  },
  {
    name: 'Alex Zhang',
    title: 'Sponsorship Manager',
    email: 'alex@wildoutproject.com',
    bio: 'Building strategic partnerships with leading brands. Connects WildOut! with companies that share our vision for creative innovation.',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    status: 'active',
    linkedin_url: 'https://linkedin.com/in/alexzhang',
    twitter_handle: '@alexzhang_partnerships'
  }
];

export const DUMMY_PARTNERS: (Database['public']['Tables']['partners']['Insert'] & { featured?: boolean })[] = [
  {
    name: 'Red Bull',
    category: 'Beverage',
    description: 'Energy drink brand sponsoring extreme sports and music events worldwide.',
    website_url: 'https://redbull.com',
    logo_url: 'https://images.unsplash.com/photo-1611159687450-46d9e2a8b4b3?w=200',
    status: 'active',
    featured: true,
    contact_email: 'partnerships@redbull.com',
    contact_phone: '+62 21 1234 5678',
    social_links: {
      instagram: 'https://instagram.com/redbull',
      facebook: 'https://facebook.com/RedBull',
      twitter: 'https://twitter.com/redbull'
    }
  },
  {
    name: 'Spotify',
    category: 'Music Streaming',
    description: 'Leading music streaming platform supporting independent artists and emerging talent.',
    website_url: 'https://spotify.com',
    logo_url: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=200',
    status: 'active',
    featured: true,
    contact_email: 'artists@spotify.com',
    contact_phone: '+62 21 8765 4321',
    social_links: {
      instagram: 'https://instagram.com/spotify',
      facebook: 'https://facebook.com/Spotify',
      twitter: 'https://twitter.com/spotify'
    }
  },
  {
    name: 'Nike',
    category: 'Apparel',
    description: 'Global sportswear brand committed to innovation and athletic excellence.',
    website_url: 'https://nike.com',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    status: 'active',
    featured: true,
    contact_email: 'sponsorship@nike.com',
    contact_phone: '+62 21 5555 1234',
    social_links: {
      instagram: 'https://instagram.com/nike',
      facebook: 'https://facebook.com/nike',
      twitter: 'https://twitter.com/nike'
    }
  },
  {
    name: 'Heineken',
    category: 'Beverage',
    description: 'Premium beer brand known for sponsoring music festivals and cultural events.',
    website_url: 'https://heineken.com',
    logo_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200',
    status: 'active',
    featured: true,
    contact_email: 'events@heineken.com',
    contact_phone: '+62 21 9876 5432',
    social_links: {
      instagram: 'https://instagram.com/heineken',
      facebook: 'https://facebook.com/Heineken',
      twitter: 'https://twitter.com/heineken'
    }
  },
  {
    name: 'Apple Music',
    category: 'Music Streaming',
    description: 'Apple\'s music streaming service featuring exclusive content and artist interviews.',
    website_url: 'https://music.apple.com',
    logo_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    status: 'active',
    featured: false,
    contact_email: 'partnerships@apple.com',
    contact_phone: '+62 21 1111 2222',
    social_links: {
      instagram: 'https://instagram.com/applemusic',
      facebook: 'https://facebook.com/applemusic',
      twitter: 'https://twitter.com/applemusic'
    }
  },
  {
    name: 'Google',
    category: 'Technology',
    description: 'Technology company supporting digital innovation and creative industries.',
    website_url: 'https://google.com',
    logo_url: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200',
    status: 'active',
    featured: false,
    contact_email: 'creatives@google.com',
    contact_phone: '+62 21 3333 4444',
    social_links: {
      instagram: 'https://instagram.com/google',
      facebook: 'https://facebook.com/google',
      twitter: 'https://twitter.com/google'
    }
  },
  {
    name: 'Gojek',
    category: 'Technology',
    description: 'Indonesia\'s leading ride-hailing and on-demand services platform.',
    website_url: 'https://gojek.com',
    logo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200',
    status: 'active',
    featured: false,
    contact_email: 'partnerships@gojek.com',
    contact_phone: '+62 21 7777 8888',
    social_links: {
      instagram: 'https://instagram.com/gojekindonesia',
      facebook: 'https://facebook.com/gojek',
      twitter: 'https://twitter.com/gojek'
    }
  },
  {
    name: 'Tokopedia',
    category: 'E-commerce',
    description: 'Indonesia\'s largest e-commerce platform connecting buyers and sellers nationwide.',
    website_url: 'https://tokopedia.com',
    logo_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200',
    status: 'active',
    featured: false,
    contact_email: 'business@tokopedia.com',
    contact_phone: '+62 21 9999 0000',
    social_links: {
      instagram: 'https://instagram.com/tokopedia',
      facebook: 'https://facebook.com/tokopedia',
      twitter: 'https://twitter.com/tokopedia'
    }
  }
];

export const DUMMY_GALLERY_ITEMS: Database['public']['Tables']['gallery_items']['Insert'][] = [
  {
    title: 'Neon Nights Festival Opening',
    description: 'The spectacular opening performance at our Neon Nights Festival featuring immersive LED installations and world-class DJs.',
    category: 'event',
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800',
    tags: ['festival', 'electronic', 'led', 'performance', 'neon-nights'],
    metadata: {
      image_urls: [
        'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800',
        'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800',
        'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800'
      ]
    },
    created_at: '2025-10-28T10:00:00Z',
    updated_at: '2025-10-28T10:00:00Z'
  },
  {
    title: 'Sunset Sessions Acoustic Performance',
    description: 'Intimate acoustic performance during golden hour at our Sunset Sessions event, featuring breathtaking views and soulful music.',
    category: 'event',
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800',
    tags: ['acoustic', 'sunset', 'performance', 'intimate', 'sunset-sessions'],
    metadata: {
      image_urls: [
        'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800',
        'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800'
      ]
    },
    created_at: '2025-10-27T18:00:00Z',
    updated_at: '2025-10-27T18:00:00Z'
  },
  {
    title: 'Urban Art Exhibition Installation',
    description: 'Interactive art installations showcasing the evolution of street art into contemporary fine art at our Urban Art Exhibition.',
    category: 'art',
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800',
    tags: ['street-art', 'installation', 'contemporary', 'urban-art', 'exhibition'],
    metadata: {
      image_urls: [
        'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800',
        'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800'
      ]
    },
    created_at: '2025-10-26T14:00:00Z',
    updated_at: '2025-10-26T14:00:00Z'
  },
  {
    title: 'Bass Rebellion Underground Vibes',
    description: 'The raw energy and heavy bass atmosphere at our Bass Rebellion underground series featuring Indonesia\'s finest bass music artists.',
    category: 'event',
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800',
    tags: ['bass', 'underground', 'electronic', 'bass-rebellion', 'heavy'],
    metadata: {
      image_urls: [
        'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800',
        'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800'
      ]
    },
    created_at: '2025-10-25T02:00:00Z',
    updated_at: '2025-10-25T02:00:00Z'
  },
  {
    title: 'Creative Team Collaboration',
    description: 'Behind the scenes look at our creative team collaborating on event concepts and production planning.',
    category: 'team',
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400',
    tags: ['team', 'collaboration', 'creative', 'behind-scenes', 'planning'],
    metadata: {
      image_urls: [
        'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400'
      ]
    },
    created_at: '2025-10-24T11:00:00Z',
    updated_at: '2025-10-24T11:00:00Z'
  },
  {
    title: 'Brand Partnership Showcase',
    description: 'Celebrating our partnerships with leading brands that support Indonesia\'s creative community.',
    category: 'partnership',
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1758922801699-09d8d788f90c?w=800',
    tags: ['partnership', 'brands', 'collaboration', 'sponsorship', 'community'],
    metadata: {
      image_urls: [
        'https://images.unsplash.com/photo-1758922801699-09d8d788f90c?w=800'
      ]
    },
    created_at: '2025-10-23T15:00:00Z',
    updated_at: '2025-10-23T15:00:00Z'
  },
  {
    title: 'Creative Industry Summit Networking',
    description: 'Industry leaders and creative professionals networking at our annual Creative Industry Summit.',
    category: 'conference',
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    tags: ['summit', 'networking', 'industry', 'conference', 'professionals'],
    metadata: {
      image_urls: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
      ]
    },
    created_at: '2025-10-22T12:00:00Z',
    updated_at: '2025-10-22T12:00:00Z'
  },
  {
    title: 'Jazz Under the Stars Evening Atmosphere',
    description: 'Elegant evening atmosphere at our Jazz Under the Stars concert featuring premium dining and smooth jazz performances.',
    category: 'event',
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    tags: ['jazz', 'evening', 'premium', 'dining', 'atmosphere'],
    metadata: {
      image_urls: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'
      ]
    },
    created_at: '2025-10-21T20:00:00Z',
    updated_at: '2025-10-21T20:00:00Z'
  }
];

// =============================================
// UTILITY FUNCTIONS FOR SEEDING
// =============================================

/**
 * Seeds the database with dummy data for development/testing
 * Run this function to populate your Supabase database with sample data
 */
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Note: You'll need to import and use the Supabase client here
    // const { supabaseClient } = await import('../supabase/client');

    console.log('✅ Dummy data prepared. Ready to seed database.');
    console.log('📊 Data includes:');
    console.log(`   - ${DUMMY_EVENTS.length} events`);
    console.log(`   - ${DUMMY_EVENT_ARTISTS.length} event artists`);
    console.log(`   - ${DUMMY_TEAM_MEMBERS.length} team members`);
    console.log(`   - ${DUMMY_PARTNERS.length} partners`);
    console.log(`   - ${DUMMY_GALLERY_ITEMS.length} gallery items`);

    // Example seeding code (uncomment and modify as needed):
    /*
    // Insert events
    for (const event of DUMMY_EVENTS) {
      const { data, error } = await supabaseClient
        .from('events')
        .insert(event);
      if (error) console.error('Error inserting event:', error);
    }

    // Insert event artists
    for (const artist of DUMMY_EVENT_ARTISTS) {
      const { data, error } = await supabaseClient
        .from('event_artists')
        .insert(artist);
      if (error) console.error('Error inserting artist:', error);
    }

    // Insert team members
    for (const member of DUMMY_TEAM_MEMBERS) {
      const { data, error } = await supabaseClient
        .from('team_members')
        .insert(member);
      if (error) console.error('Error inserting team member:', error);
    }

    // Insert partners
    for (const partner of DUMMY_PARTNERS) {
      const { data, error } = await supabaseClient
        .from('partners')
        .insert(partner);
      if (error) console.error('Error inserting partner:', error);
    }

    // Insert gallery items
    for (const item of DUMMY_GALLERY_ITEMS) {
      const { data, error } = await supabaseClient
        .from('gallery_items')
        .insert(item);
      if (error) console.error('Error inserting gallery item:', error);
    }
    */

    console.log('🎉 Seeding completed!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

// =============================================
// DATA EXPORT FOR EASY ACCESS
// =============================================

export const DUMMY_DATA = {
  events: DUMMY_EVENTS,
  eventArtists: DUMMY_EVENT_ARTISTS,
  teamMembers: DUMMY_TEAM_MEMBERS,
  partners: DUMMY_PARTNERS,
  galleryItems: DUMMY_GALLERY_ITEMS
};

// Export individual arrays for convenience
export default DUMMY_DATA;
