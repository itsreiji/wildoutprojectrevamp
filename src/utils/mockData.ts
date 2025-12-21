import type {
  HeroContent,
  AboutContent,
  SiteSettings,
  GalleryImage,
  TeamMember,
  Partner,
  PublicEventView
} from '../types/content';

export const MOCK_HERO: HeroContent = {
  id: 'mock-hero',
  title: 'Elevate Your Nightlife Experience',
  subtitle: 'The Premier Event Discovery Platform in Indonesia',
  description: 'Uncover the most exclusive gatherings, high-energy festivals, and underground creative scenes. Join the community redefining how we celebrate.',
  stats: {
    events: '150+',
    members: '25k+',
    partners: '45+'
  },
  cta_text: 'Discover Events',
  cta_link: '/events',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: null
};

export const MOCK_ABOUT: AboutContent = {
  id: 'mock-about',
  title: 'The WildOut! Story',
  subtitle: 'Pioneering Creative Connections',
  founded_year: '2020',
  story: [
    'WildOut! was born from a singular vision: to bridge the gap between Indonesia\'s vibrant creative talent and the audiences that crave authentic experiences.',
    'What started as a niche community has evolved into a comprehensive ecosystem that empowers artists, event organizers, and attendees to connect in meaningful ways.'
  ],
  features: [
    { title: 'VIP Access', description: 'Unlock exclusive entry to members-only showcases and priority ticket reservations.' },
    { title: 'Expertly Curated', description: 'Our team hand-picks every experience to ensure the highest standards of production and creativity.' },
    { title: 'Secure Ticketing', description: 'Seamless, fraud-proof digital ticketing for a worry-free entry experience every time.' },
    { title: 'Global Community', description: 'Connect with a diverse network of trendsetters and creative enthusiasts from across the region.' }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: null
};

export const MOCK_SETTINGS: SiteSettings = {
  id: 'mock-settings',
  site_name: 'WildOut!',
  site_description: 'Indonesia\'s Leading Creative Event & Lifestyle Platform',
  tagline: 'Stay Wild, Stay Inspired',
  email: 'connect@wildoutproject.com',
  phone: '+62 21 5088 0123',
  address: 'Jakarta Creative Hub, Central Jakarta, Indonesia',
  social_media: {
    instagram: 'https://instagram.com/wildout.project',
    twitter: 'https://twitter.com/wildoutproject',
    facebook: 'https://facebook.com/wildoutproject'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: null
};

export const MOCK_GALLERY: GalleryImage[] = [
  {
    id: 'mock-gallery-1',
    title: 'Summer Festival 2023',
    description: 'A beautiful night at the summer festival.',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    category: 'Festival',
    display_order: 1,
    event_id: null,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-gallery-2',
    title: 'Rooftop Party',
    description: 'City lights and good vibes.',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    category: 'Party',
    display_order: 2,
    event_id: null,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MOCK_TEAM: TeamMember[] = [
  {
    id: 'mock-team-1',
    name: 'Jane Doe',
    title: 'Founder & CEO',
    bio: 'Jane is the visionary behind WildOut!, with over 10 years of experience in the event industry.',
    avatar_url: 'https://i.pravatar.cc/150?u=jane',
    email: 'jane@wildoutproject.com',
    status: 'active',
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'mock-partner-1',
    name: 'EventPro',
    description: 'Professional event equipment and logistics.',
    logo_url: 'https://via.placeholder.com/150?text=EventPro',
    website_url: 'https://eventpro.example.com',
    category: 'Logistics',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MOCK_EVENTS: PublicEventView[] = [
  {
    id: 'mock-event-1',
    title: 'Sample Event',
    description: 'This is a sample event to show when the database is not connected.',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 3600000).toISOString(),
    location: 'Virtual Location',
    price: 0,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
    status: 'published',
    category: 'General',
    tags: ['sample', 'mock'],
    partner_name: 'WildOut!',
    partner_logo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    artists: [],
    gallery: [],
    highlights: [],
    metadata: {},
    ticket_url: null,
    attendees: 0,
    capacity: 100,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
    price_range: 'Free',
    short_description: 'This is a sample event.'
  }
];
