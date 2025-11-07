/* @refresh reset */
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabaseClient } from '../supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '../supabase/types';
import { DUMMY_EVENTS, DUMMY_EVENT_ARTISTS, DUMMY_TEAM_MEMBERS, DUMMY_PARTNERS, DUMMY_GALLERY_ITEMS } from '../data/dummyData';
import { cleanupEventAssets, cleanupTeamMemberAsset, cleanupPartnerAsset, cleanupGalleryAsset } from '../utils/storageHelpers';

// Re-export types from the new Supabase schema
export type Event = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  category: string;
  status: string;
  capacity: number | null;
  price_range: string | null;
  ticket_url: string | null;
  partner_name: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  // Legacy/compatibility fields for UI components
  date?: string;
  time?: string;
  venue?: string;
  venueAddress?: string;
  image?: string;
  attendees?: number;
  price?: string;
  artists?: Array<{
    name: string;
    role: string;
    image: string;
  }>;
  gallery?: string[];
  highlights?: string[];
  // Joined data from views/functions
  partner_logo_url?: string | null;
  partner_website_url?: string | null;
};

export type TeamMember = Tables<'team_members'>;
export type Partner = Tables<'partners'>;
export type GalleryImage = Tables<'gallery_items'>;

// Legacy types for backward compatibility (to be updated)
export type HeroContent = {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
};

export type AboutContent = {
  title: string;
  description: string;
  mission: string;
  values: string[];
  stats: Array<{ label: string; value: string }>;
};

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  primaryColor: string;
  socialLinks: Record<string, string>;
};

// =============================================
// DATA FETCHING FUNCTIONS (New Supabase Schema)
// =============================================

// Events fetching with new schema
const fetchEvents = async (): Promise<Event[]> => {
  try {
    // Use the public_events view for querying
    const { data, error } = await supabaseClient
      .from('public_events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return (data || []).map(event => ({
      ...event,
      // Transform view data to match Event type
      date: event.start_date.split('T')[0], // Extract date part
      time: `${new Date(event.start_date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })} - ${new Date(event.end_date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      venue: event.location || 'TBD',
      venueAddress: event.location || '',
      category: event.category,
      status: event.status,
      capacity: event.max_attendees || undefined,
      price: event.price ? `${event.currency} ${event.price}` : 'TBD',
      // Keep the new schema fields
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      partner_name: event.partner_name,
      ticket_url: event.ticket_url,
      price_range: event.price ? `${event.currency} ${event.price}` : undefined,
    })) as Event[];
  } catch (error) {
    console.error('Error in fetchEvents:', error);
    return [];
  }
};

// Team members fetching
const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('team_members')
      .select('*')
      .eq('status', 'active')
      .order('display_order')
      .order('name');

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchTeamMembers:', error);
    return [];
  }
};

// Partners fetching
const fetchPartners = async (): Promise<Partner[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('partners')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching partners:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchPartners:', error);
    return [];
  }
};

// Gallery fetching
const fetchGallery = async (): Promise<GalleryImage[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('gallery_items')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gallery:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchGallery:', error);
    return [];
  }
};

// =============================================
// LEGACY DATA (For Backward Compatibility During Migration)
// =============================================

// Placeholder for legacy data structure until full migration
const INITIAL_EVENTS: Event[] = [
  // This would be removed after migration is complete
  // For now, keeping minimal placeholder data
  {
    id: '4',
    title: 'Bass Rebellion: Underground Series',
    description: 'Dive deep into underground bass music scene with Indonesia\'s finest dubstep, drum & bass, and trap artists. This is not for the faint of heart.',
    date: '2025-12-01',
    time: '22:00 - 05:00',
    venue: 'The Bunker',
    venueAddress: 'Jl. Kemang Raya, Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMHBlcmZvcm1hbmNlJTIwY2x1YnxlbnwxfHx8fDE3NjE4MTgwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Club Night',
    capacity: 1500,
    attendees: 1200,
    price: 'IDR 150K',
    artists: [
      { name: 'Bass Monkey', role: 'Headliner', image: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=400' },
      { name: 'Subsonic', role: 'Supporting', image: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400' },
      { name: 'Frequency', role: 'Opening', image: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800',
      'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800',
    ],
    highlights: [
      'Underground warehouse venue',
      'Heavy bass sound system',
      'Live visuals and lasers',
      'Multiple stages',
      'After-hours access',
    ],
    status: 'upcoming',
  },
];

const INITIAL_PARTNERS: Partner[] = [
  { id: '1', name: 'Spotify', category: 'Music', website: 'spotify.com', status: 'active' },
  { id: '2', name: 'Red Bull', category: 'Energy', website: 'redbull.com', status: 'active' },
  { id: '3', name: 'Heineken', category: 'Beverage', website: 'heineken.com', status: 'active' },
  { id: '4', name: 'Nike', category: 'Lifestyle', website: 'nike.com', status: 'active' },
  { id: '5', name: 'Adidas', category: 'Lifestyle', website: 'adidas.com', status: 'active' },
  { id: '6', name: 'Apple Music', category: 'Music', website: 'apple.com/music', status: 'active' },
  { id: '7', name: 'Corona', category: 'Beverage', website: 'corona.com', status: 'active' },
  { id: '8', name: 'Converse', category: 'Lifestyle', website: 'converse.com', status: 'active' },
  { id: '9', name: 'Gojek', category: 'Technology', website: 'gojek.com', status: 'active' },
  { id: '10', name: 'Tokopedia', category: 'E-commerce', website: 'tokopedia.com', status: 'active' },
  { id: '11', name: 'BCA', category: 'Financial', website: 'bca.co.id', status: 'active' },
  { id: '12', name: 'Telkomsel', category: 'Telecom', website: 'telkomsel.com', status: 'active' },
];

const INITIAL_GALLERY: GalleryImage[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800', caption: 'Neon Nights Festival', uploadDate: '2025-10-28', event: 'Neon Nights' },
  { id: '2', url: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800', caption: 'Concert Crowd', uploadDate: '2025-10-27', event: 'Sunset Sessions' },
  { id: '3', url: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800', caption: 'DJ Performance', uploadDate: '2025-10-26', event: 'Bass Rebellion' },
  { id: '4', url: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800', caption: 'Art Exhibition', uploadDate: '2025-10-25', event: 'Urban Art' },
  { id: '5', url: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=800', caption: 'Creative Team', uploadDate: '2025-10-24' },
  { id: '6', url: 'https://images.unsplash.com/photo-1758922801699-09d8d788f90c?w=800', caption: 'Brand Partnership', uploadDate: '2025-10-23' },
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    email: 'sarah@wildout.id',
    phone: '+62 812 3456 7890',
    bio: 'Visionary leader with 10+ years experience in nightlife and entertainment industry',
    photoUrl: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400',
    status: 'active',
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Creative Director',
    email: 'michael@wildout.id',
    phone: '+62 813 7654 3210',
    bio: 'Award-winning creative with passion for innovative event experiences',
    photoUrl: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400',
    status: 'active',
  },
  {
    id: '3',
    name: 'Aisha Patel',
    role: 'Marketing Director',
    email: 'aisha@wildout.id',
    phone: '+62 814 8765 4321',
    bio: 'Digital marketing strategist specializing in community engagement',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    status: 'active',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Operations Manager',
    email: 'david@wildout.id',
    phone: '+62 815 2468 1357',
    bio: 'Expert in logistics and operational excellence for large-scale events',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    status: 'active',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    role: 'Event Coordinator',
    email: 'priya@wildout.id',
    phone: '+62 816 9753 8642',
    bio: 'Meticulous planner ensuring flawless event execution',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    status: 'active',
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Technical Director',
    email: 'james@wildout.id',
    phone: '+62 817 3698 5274',
    bio: 'Audio-visual expert with cutting-edge production knowledge',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    status: 'active',
  },
  {
    id: '7',
    name: 'Natasha Williams',
    role: 'Social Media Manager',
    email: 'natasha@wildout.id',
    phone: '+62 818 7531 9864',
    bio: 'Content creator building vibrant online communities',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    status: 'active',
  },
  {
    id: '8',
    name: 'Alex Zhang',
    role: 'Sponsorship Manager',
    email: 'alex@wildout.id',
    phone: '+62 819 8524 7136',
    bio: 'Building strategic partnerships with leading brands',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    status: 'active',
  },
  {
    id: '9',
    name: 'Maria Santos',
    role: 'Artist Relations',
    email: 'maria@wildout.id',
    phone: '+62 820 1472 5836',
    bio: 'Connecting top talent with incredible event opportunities',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    status: 'active',
  },
  {
    id: '10',
    name: 'Ryan Thompson',
    role: 'Design Lead',
    email: 'ryan@wildout.id',
    phone: '+62 821 9517 3648',
    bio: 'Creating stunning visual identities for memorable events',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    status: 'active',
  },
  {
    id: '11',
    name: 'Lily Anderson',
    role: 'Customer Experience',
    email: 'lily@wildout.id',
    phone: '+62 822 7539 5148',
    bio: 'Ensuring every guest has an unforgettable experience',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    status: 'active',
  },
  {
    id: '12',
    name: 'Omar Hassan',
    role: 'Finance Manager',
    email: 'omar@wildout.id',
    phone: '+62 823 8642 9753',
    bio: 'Managing financial strategy and sustainable growth',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    status: 'active',
  },
];

const INITIAL_HERO: HeroContent = {
  title: 'WildOut!',
  subtitle: 'Media Digital Nightlife & Event Multi-Platform',
  description: "Indonesia's premier creative community connecting artists, events, and experiences. Join us in celebrating nightlife culture and creative collaborations.",
  stats: {
    events: '500+',
    members: '50K+',
    partners: '100+',
  },
};

const INITIAL_ABOUT: AboutContent = {
  title: 'About WildOut!',
  subtitle: "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020. We're more than just events – we're a movement.",
  story: [
    "Founded in 2020, WildOut! emerged from a simple idea: to create a platform that celebrates Indonesia's vibrant creative culture. What started as small gatherings has grown into one of the country's most influential creative communities.",
    "We've hosted over 500 events, connected more than 50,000 creative professionals, and partnered with 100+ brands to bring unforgettable experiences to our community. From intimate art exhibitions to massive music festivals, we're dedicated to showcasing the best of Indonesia's creative talent.",
    "Our mission is to empower artists, connect communities, and push boundaries of what's possible in nightlife and event culture. Join us in shaping the future of Indonesia's creative scene.",
  ],
  foundedYear: '2020',
  features: [
    {
      title: 'Community First',
      description: 'We bring together passionate creatives, artists, and event enthusiasts to build lasting connections.',
    },
    {
      title: 'Unforgettable Experiences',
      description: 'Every event is crafted to deliver unique, memorable moments that resonate with our community.',
    },
    {
      title: 'Collaborative Spirit',
      description: 'We partner with local and international brands to create opportunities for growth and collaboration.',
    },
    {
      title: 'Creative Innovation',
      description: 'Pushing boundaries with cutting-edge production, technology, and artistic expression.',
    },
  ],
};

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'WildOut!',
  siteDescription: 'Media Digital Nightlife & Event Multi-Platform',
  tagline: "Indonesia's premier creative community platform",
  email: 'contact@wildout.id',
  phone: '+62 21 1234 567',
  address: 'Jakarta, Indonesia',
  socialMedia: {
    instagram: 'https://instagram.com/wildout.id',
    twitter: 'https://twitter.com/wildout_id',
    facebook: 'https://facebook.com/wildout.id',
    youtube: 'https://youtube.com/@wildout',
  },
};

// Context
interface ContentContextType {
  events: Event[];
  partners: Partner[];
  gallery: GalleryImage[];
  team: TeamMember[];
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
  loading?: boolean;
  error?: string | null;
  updateEvents: (events: Event[]) => void;
  updatePartners: (partners: Partner[]) => void;
  updateGallery: (gallery: GalleryImage[]) => void;
  updateTeam: (team: TeamMember[]) => void;
  updateHero: (hero: HeroContent) => void;
  updateAbout: (about: AboutContent) => void;
  updateSettings: (settings: SiteSettings) => void;
  // Event mutations
  addEvent: (event: TablesInsert<'events'>) => Promise<Event>;
  updateEvent: (id: string, updates: TablesUpdate<'events'>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  // Team member mutations
  addTeamMember: (member: TablesInsert<'team_members'>) => Promise<TeamMember>;
  updateTeamMember: (id: string, updates: TablesUpdate<'team_members'>) => Promise<TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;
  // Partner mutations
  addPartner: (partner: TablesInsert<'partners'>) => Promise<Partner>;
  updatePartner: (id: string, updates: TablesUpdate<'partners'>) => Promise<Partner>;
  deletePartner: (id: string) => Promise<void>;
  // Gallery mutations
  addGalleryImage: (item: TablesInsert<'gallery_items'>) => Promise<GalleryImage>;
  updateGalleryImage: (id: string, updates: TablesUpdate<'gallery_items'>) => Promise<GalleryImage>;
  deleteGalleryImage: (id: string) => Promise<void>;
  // Dummy data control
  useDummyData: boolean;
  setUseDummyData: (use: boolean) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{
  children: ReactNode;
  useDummyData?: boolean;
}> = ({ children, useDummyData: initialUseDummyData = false }) => {
  // Initialize with empty arrays - data will be fetched on mount
  const [events, setEvents] = useState<Event[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
  const [about, setAbout] = useState<AboutContent>(INITIAL_ABOUT);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDummyData, setUseDummyData] = useState(initialUseDummyData);

  // Fetch data from new Supabase schema on mount or when dummy data flag changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (useDummyData) {
          // Use dummy data for development/testing
          console.log('🔧 Using dummy data for development');

          // Transform dummy events to match Event type
          const dummyEvents: Event[] = DUMMY_EVENTS.map(event => ({
            ...event,
            id: event.id || `event-${Date.now()}-${Math.random()}`,
            date: event.start_date.split('T')[0],
            time: `${new Date(event.start_date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })} - ${new Date(event.end_date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}`,
            venue: event.location || 'TBD',
            venueAddress: event.location || '',
            category: event.category,
            status: event.status,
            capacity: event.capacity || undefined,
            price: event.price_range || 'TBD',
            start_date: event.start_date,
            end_date: event.end_date,
            location: event.location,
            partner_name: event.partner_name,
            ticket_url: event.ticket_url,
            price_range: event.price_range,
          }));

          // Set dummy data
          setEvents(dummyEvents);
          setPartners(DUMMY_PARTNERS.map(p => ({ ...p, id: p.id || `partner-${Date.now()}-${Math.random()}` })));
          setGallery(DUMMY_GALLERY_ITEMS.map(g => ({ ...g, id: g.id || `gallery-${Date.now()}-${Math.random()}` })));
          setTeam(DUMMY_TEAM_MEMBERS.map(t => ({ ...t, id: t.id || `team-${Date.now()}-${Math.random()}` })));

        } else {
          // Fetch all data concurrently from Supabase
          const [eventsData, partnersData, galleryData, teamData] = await Promise.all([
            fetchEvents(),
            fetchPartners(),
            fetchGallery(),
            fetchTeamMembers(),
          ]);

          // Update state with fetched data
          setEvents(eventsData);
          setPartners(partnersData);
          setGallery(galleryData);
          setTeam(teamData);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');

        // Fallback to legacy data if Supabase fails
        console.warn('Falling back to legacy data structure');
        setEvents(INITIAL_EVENTS);
        setPartners(INITIAL_PARTNERS);
        setGallery(INITIAL_GALLERY);
        setTeam(INITIAL_TEAM);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [useDummyData]);

  // =============================================
  // MUTATION FUNCTIONS
  // =============================================

  // Event Mutations
  const addEvent = async (event: TablesInsert<'events'>): Promise<Event> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .from('events')
        .insert(event)
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error);
        setError(`Failed to add event: ${error.message}`);
        throw error;
      }

      if (data) {
        // Transform the database response to match Event type
        const newEvent: Event = {
          ...data,
          date: data.start_date.split('T')[0],
          time: `${new Date(data.start_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })} - ${new Date(data.end_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          venue: data.location || 'TBD',
          venueAddress: data.location || '',
          category: data.category,
          status: data.status,
          capacity: data.capacity || undefined,
          price: data.price_range || 'TBD',
          start_date: data.start_date,
          end_date: data.end_date,
          location: data.location,
          partner_name: data.partner_name,
          ticket_url: data.ticket_url,
          price_range: data.price_range,
        };

        // Optimistically update local state
        setEvents(prev => [...prev, newEvent]);

        return newEvent;
      }

      throw new Error('No data returned from insert operation');
    } catch (err) {
      console.error('Error in addEvent:', err);
      setError('Failed to add event');
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: TablesUpdate<'events'>): Promise<Event> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        setError(`Failed to update event: ${error.message}`);
        throw error;
      }

      if (data) {
        // Transform the database response to match Event type
        const updatedEvent: Event = {
          ...data,
          date: data.start_date.split('T')[0],
          time: `${new Date(data.start_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })} - ${new Date(data.end_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          venue: data.location || 'TBD',
          venueAddress: data.location || '',
          category: data.category,
          status: data.status,
          capacity: data.capacity || undefined,
          price: data.price_range || 'TBD',
          start_date: data.start_date,
          end_date: data.end_date,
          location: data.location,
          partner_name: data.partner_name,
          ticket_url: data.ticket_url,
          price_range: data.price_range,
        };

        // Optimistically update local state
        setEvents(prev => prev.map(event =>
          event.id === id ? updatedEvent : event
        ));

        return updatedEvent;
      }

      throw new Error('No data returned from update operation');
    } catch (err) {
      console.error('Error in updateEvent:', err);
      setError('Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      setError(null);

      // First, get the event to find out about associated images
      const { data: eventToDelete, error: fetchError } = await supabaseClient
        .from('events')
        .select('metadata')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching event for deletion:', fetchError);
        // We can still proceed to try and delete the db record
      }

      // Delete database record first, then clean up storage
      // This ensures data consistency even if storage cleanup fails
      const { error: deleteError } = await supabaseClient
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting event:', deleteError);
        setError(`Failed to delete event: ${deleteError.message}`);
        throw deleteError;
      }

      // Now clean up associated storage assets
      if (eventToDelete?.metadata) {
        await cleanupEventAssets(eventToDelete.metadata);
      }

      // Optimistically update local state after successful deletion
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      console.error('Error in deleteEvent:', err);
      setError('Failed to delete event');
      throw err;
    }
  };

  // Team Member Mutations
  const addTeamMember = async (member: TablesInsert<'team_members'>): Promise<TeamMember> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .from('team_members')
        .insert(member)
        .select()
        .single();

      if (error) {
        console.error('Error adding team member:', error);
        setError(`Failed to add team member: ${error.message}`);
        throw error;
      }

      if (data) {
        // Optimistically update local state
        setTeam(prev => [...prev, data]);
        return data;
      }

      throw new Error('No data returned from insert operation');
    } catch (err) {
      console.error('Error in addTeamMember:', err);
      setError('Failed to add team member');
      throw err;
    }
  };

  const updateTeamMember = async (id: string, updates: TablesUpdate<'team_members'>, oldAvatarUrl?: string | null): Promise<TeamMember> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating team member:', error);
        setError(`Failed to update team member: ${error.message}`);
        throw error;
      }

      // Clean up old avatar if a new one was provided
      if (oldAvatarUrl && updates.avatar_url && oldAvatarUrl !== updates.avatar_url) {
        await cleanupTeamMemberAsset(oldAvatarUrl);
      }

      if (data) {
        // Optimistically update local state
        setTeam(prev => prev.map(member =>
          member.id === id ? data : member
        ));
        return data;
      }

      throw new Error('No data returned from update operation');
    } catch (err) {
      console.error('Error in updateTeamMember:', err);
      setError('Failed to update team member');
      throw err;
    }
  };

  const deleteTeamMember = async (id: string): Promise<void> => {
    try {
      setError(null);

      // Find the team member to get their avatar URL for cleanup
      const memberToDelete = team.find(member => member.id === id);

      // Delete database record first, then clean up storage
      // This ensures data consistency even if storage cleanup fails
      const { error } = await supabaseClient
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting team member:', error);
        setError(`Failed to delete team member: ${error.message}`);
        throw error;
      }

      // Now clean up associated storage assets
      if (memberToDelete?.avatar_url) {
        await cleanupTeamMemberAsset(memberToDelete.avatar_url);
      }

      // Optimistically update local state
      setTeam(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error('Error in deleteTeamMember:', err);
      setError('Failed to delete team member');
      throw err;
    }
  };

  // Partner Mutations
  const addPartner = async (partner: TablesInsert<'partners'>): Promise<Partner> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .from('partners')
        .insert(partner)
        .select()
        .single();

      if (error) {
        console.error('Error adding partner:', error);
        setError(`Failed to add partner: ${error.message}`);
        throw error;
      }

      if (data) {
        // Optimistically update local state
        setPartners(prev => [...prev, data]);
        return data;
      }

      throw new Error('No data returned from insert operation');
    } catch (err) {
      console.error('Error in addPartner:', err);
      setError('Failed to add partner');
      throw err;
    }
  };

  const updatePartner = async (id: string, updates: TablesUpdate<'partners'>, oldLogoUrl?: string | null): Promise<Partner> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating partner:', error);
        setError(`Failed to update partner: ${error.message}`);
        throw error;
      }

      // Clean up old logo if a new one was provided
      if (oldLogoUrl && updates.logo_url && oldLogoUrl !== updates.logo_url) {
        await cleanupPartnerAsset(oldLogoUrl);
      }

      if (data) {
        // Optimistically update local state
        setPartners(prev => prev.map(partner =>
          partner.id === id ? data : partner
        ));
        return data;
      }

      throw new Error('No data returned from update operation');
    } catch (err) {
      console.error('Error in updatePartner:', err);
      setError('Failed to update partner');
      throw err;
    }
  };

  const deletePartner = async (id: string): Promise<void> => {
    try {
      setError(null);

      // Find the partner to get their logo URL for cleanup
      const partnerToDelete = partners.find(partner => partner.id === id);

      // Delete database record first, then clean up storage
      // This ensures data consistency even if storage cleanup fails
      const { error } = await supabaseClient
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting partner:', error);
        setError(`Failed to delete partner: ${error.message}`);
        throw error;
      }

      // Now clean up associated storage assets
      if (partnerToDelete?.logo_url) {
        await cleanupPartnerAsset(partnerToDelete.logo_url);
      }

      // Optimistically update local state
      setPartners(prev => prev.filter(partner => partner.id !== id));
    } catch (err) {
      console.error('Error in deletePartner:', err);
      setError('Failed to delete partner');
      throw err;
    }
  };

  // Gallery Mutations
  const addGalleryImage = async (item: TablesInsert<'gallery_items'>): Promise<GalleryImage> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .from('gallery_items')
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error('Error adding gallery image:', error);
        setError(`Failed to add gallery image: ${error.message}`);
        throw error;
      }

      if (data) {
        // Optimistically update local state
        setGallery(prev => [...prev, data]);
        return data;
      }

      throw new Error('No data returned from insert operation');
    } catch (err) {
      console.error('Error in addGalleryImage:', err);
      setError('Failed to add gallery image');
      throw err;
    }
  };

  const updateGalleryImage = async (id: string, updates: TablesUpdate<'gallery_items'>, oldImageUrls?: string[] | null): Promise<GalleryImage> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .from('gallery_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating gallery image:', error);
        setError(`Failed to update gallery image: ${error.message}`);
        throw error;
      }

      // Clean up old images if a new ones were provided
      if (oldImageUrls && updates.image_urls) {
        const oldUrls = Array.isArray(oldImageUrls) ? oldImageUrls : [];
        const newUrls = Array.isArray(updates.image_urls) ? updates.image_urls : [];
        // Only clean up URLs that are not in the new list
        const urlsToCleanup = oldUrls.filter((url: string) => !newUrls.includes(url));
        if (urlsToCleanup.length > 0) {
          await cleanupGalleryAsset(urlsToCleanup);
        }
      }

      if (data) {
        // Optimistically update local state
        setGallery(prev => prev.map(image =>
          image.id === id ? data : image
        ));
        return data;
      }

      throw new Error('No data returned from update operation');
    } catch (err) {
      console.error('Error in updateGalleryImage:', err);
      setError('Failed to update gallery image');
      throw err;
    }
  };

  const deleteGalleryImage = async (id: string): Promise<void> => {
    try {
      setError(null);

      // Find the gallery item to get its image URLs for cleanup
      const itemToDelete = gallery.find(item => item.id === id);

      // Delete database record first, then clean up storage
      // This ensures data consistency even if storage cleanup fails
      const { error } = await supabaseClient
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting gallery item:', error);
        setError(`Failed to delete gallery item: ${error.message}`);
        throw error;
      }

      // Now clean up associated storage assets (image_urls is a JSON array)
      if (itemToDelete?.image_urls && Array.isArray(itemToDelete.image_urls)) {
        await cleanupGalleryAsset(itemToDelete.image_urls as string[]);
      }

      // Optimistically update local state
      setGallery(prev => prev.filter(image => image.id !== id));
    } catch (err) {
      console.error('Error in deleteGalleryImage:', err);
      setError('Failed to delete gallery item');
      throw err;
    }
  };

  const value = {
    events,
    partners,
    gallery,
    team,
    hero,
    about,
    settings,
    updateEvents: setEvents,
    updatePartners: setPartners,
    updateGallery: setGallery,
    updateTeam: setTeam,
    updateHero: setHero,
    updateAbout: setAbout,
    updateSettings: setSettings,
    // Add loading and error states for UI feedback
    loading,
    error,
    // Dummy data control
    useDummyData,
    setUseDummyData,
    // Event mutations
    addEvent,
    updateEvent,
    deleteEvent,
    // Team member mutations
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    // Partner mutations
    addPartner,
    updatePartner,
    deletePartner,
    // Gallery mutations
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
