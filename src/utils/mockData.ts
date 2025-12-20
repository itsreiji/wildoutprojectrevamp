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
  title: 'Welcome to WildOut!',
  subtitle: 'The Ultimate Event Experience',
  description: 'Join us for the most exciting events in the city. Experience the wild side of entertainment.',
  stats: {
    events: '50+',
    members: '10k+',
    partners: '20+'
  },
  cta_text: 'Explore Events',
  cta_link: '/events',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: null
};

export const MOCK_ABOUT: AboutContent = {
  id: 'mock-about',
  title: 'Our Story',
  subtitle: 'Passion for Events',
  founded_year: '2020',
  story: [
    'WildOut! started with a simple idea: to bring people together through unforgettable experiences.',
    'Over the years, we have grown into a leading event management platform, connecting thousands of people with the best events in town.'
  ],
  features: [
    { title: 'Exclusive Access', description: 'Get access to members-only events and early bird tickets.' },
    { title: 'Curated Experiences', description: 'We hand-pick the best events to ensure a high-quality experience.' }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: null
};

export const MOCK_SETTINGS: SiteSettings = {
  id: 'mock-settings',
  site_name: 'WildOut!',
  site_description: 'The Ultimate Event Experience Platform',
  tagline: 'Stay Wild, Stay Connected',
  email: 'hello@wildoutproject.com',
  phone: '+1 (555) 123-4567',
  address: '123 Event Street, Cityville, ST 12345',
  social_media: {
    instagram: 'https://instagram.com/wildout',
    twitter: 'https://twitter.com/wildout',
    facebook: 'https://facebook.com/wildout'
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
