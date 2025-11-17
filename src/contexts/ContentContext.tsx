/* @refresh reset */
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabaseClient } from '../supabase/client';
import { useAuth } from './AuthContext';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../supabase/types';
import { DUMMY_EVENTS, DUMMY_EVENT_ARTISTS, DUMMY_TEAM_MEMBERS, DUMMY_PARTNERS, DUMMY_GALLERY_ITEMS } from '../data/dummyData';
import { cleanupEventAssets, cleanupTeamMemberAsset, cleanupPartnerAsset, cleanupGalleryAsset } from '../utils/storageHelpers';
import type {
  Event as LandingEvent,
  TeamMember as TeamMemberDto,
  Partner as PartnerDto,
  HeroContent as HeroContentDto,
  AboutContent as AboutContentDto,
  GalleryImage as GalleryImageDto,
  SiteSettings as SiteSettingsDto,
} from '@/types';
import type { Database } from '../supabase/types';

export type Event = LandingEvent;
export type TeamMember = TeamMemberDto;
export type Partner = PartnerDto;
export type GalleryImage = GalleryImageDto;
export type HeroContent = HeroContentDto;
export type AboutContent = AboutContentDto;
export type SiteSettings = SiteSettingsDto;

// Admin section types (manually defined until types are regenerated)
export type AdminSection = {
  id: string;
  slug: string;
  label: string;
  icon: string;
  category: string;
  order_index: number;
  enabled: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type SectionContent = {
  id: string;
  section_id: string;
  payload: any;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type RolePermission = {
  id: string;
  role: string;
  section_slug: string;
  can_view: boolean;
  can_edit: boolean;
  can_publish: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type UserPermission = {
  id: string;
  profile_id: string;
  section_slug: string;
  can_view: boolean | null;
  can_edit: boolean | null;
  can_publish: boolean | null;
  can_delete: boolean | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

// Admin permission types
export type SectionPermissions = {
  canView: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

const normalizeSocialLinks = (value: Json | undefined): Record<string, string | null> | null => {
  if (!value || typeof value === 'string') return null;
  if (Array.isArray(value)) return null;
  return Object.entries(value as Record<string, Json | undefined>).reduce<Record<string, string | null>>(
    (acc, [key, entry]) => {
      if (typeof entry === 'string') {
        acc[key] = entry;
      } else if (typeof entry === 'number' || typeof entry === 'boolean') {
        acc[key] = String(entry);
      } else if (entry === null || entry === undefined) {
        acc[key] = null;
      }
      return acc;
    },
    {}
  );
};

const ensureStringArray = (value: Json | undefined): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return undefined;
};

// =============================================
// DATA FETCHING FUNCTIONS (New Supabase Schema)
// =============================================

// Content fetching functions for site-wide content
const fetchHeroContent = async (): Promise<HeroContent> => {
  try {
    const { data, error } = await supabaseClient.rpc('get_hero_content');

    if (error) {
      console.error('Error fetching hero content:', error);
      return INITIAL_HERO;
    }

    if (data) {
      return {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        stats: data.stats as HeroContent['stats'],
        ctaText: data.cta_text,
        ctaLink: data.cta_link,
      };
    }

    return INITIAL_HERO;
  } catch (error) {
    console.error('Error in fetchHeroContent:', error);
    return INITIAL_HERO;
  }
};

const fetchAboutContent = async (): Promise<AboutContent> => {
  try {
    const { data, error } = await supabaseClient.rpc('get_about_content');

    if (error) {
      console.error('Error fetching about content:', error);
      return INITIAL_ABOUT;
    }

    if (data) {
      return {
        title: data.title,
        subtitle: data.subtitle,
        foundedYear: data.founded_year,
        story: data.story,
        features: data.features as AboutContent['features'],
      };
    }

    return INITIAL_ABOUT;
  } catch (error) {
    console.error('Error in fetchAboutContent:', error);
    return INITIAL_ABOUT;
  }
};

const fetchSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const { data, error } = await supabaseClient.rpc('get_site_settings');

    if (error) {
      console.error('Error fetching site settings:', error);
      return INITIAL_SETTINGS;
    }

    if (data) {
      return {
        siteName: data.site_name,
        siteDescription: data.site_description,
        tagline: data.tagline,
        email: data.email,
        phone: data.phone,
        address: data.address,
        socialMedia: data.social_media as SiteSettings['socialMedia'],
      };
    }

    return INITIAL_SETTINGS;
  } catch (error) {
    console.error('Error in fetchSiteSettings:', error);
    return INITIAL_SETTINGS;
  }
};

// Events fetching with new schema
const fetchEvents = async (): Promise<LandingEvent[]> => {
  try {
// Use the public_events_view for querying
    const { data, error } = await supabaseClient
      .from('public_events_view')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    const rows = (data || []) as PublicEventsViewRow[];
    return rows.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
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
      image: event.image || event.banner_image || '',
      category: event.category || null,
      status: (event.status as LandingEvent['status']) || 'upcoming',
      capacity: event.max_attendees || undefined,
      attendees: event.attendees,
      price: event.price ? `${event.currency} ${event.price}` : event.price,
      price_range: event.price ? `${event.currency} ${event.price}` : event.price_range,
      ticket_url: event.ticket_url,
      artists: event.artists || [],
      gallery: event.gallery || [],
      highlights: event.highlights || [],
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      partner_name: event.partner_name,
      partner_logo_url: event.partner_logo_url,
      partner_website_url: event.partner_website_url,
    })) as LandingEvent[];
  } catch (error) {
    console.error('Error in fetchEvents:', error);
    return [];
  }
};

// Team members fetching
const fetchTeamMembers = async (): Promise<TeamMemberDto[]> => {
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

    return (data || []) as TeamMemberDto[];
  } catch (error) {
    console.error('Error in fetchTeamMembers:', error);
    return [];
  }
};

// Partners fetching
const fetchPartners = async (): Promise<PartnerDto[]> => {
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

    return (data || []) as PartnerDto[];
  } catch (error) {
    console.error('Error in fetchPartners:', error);
    return [];
  }
};

// Gallery fetching
const fetchGallery = async (): Promise<GalleryImageDto[]> => {
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

    return (data || []) as GalleryImageDto[];
  } catch (error) {
    console.error('Error in fetchGallery:', error);
    return [];
  }
};

// =============================================
// LEGACY DATA (For Backward Compatibility During Migration)
// =============================================




// Placeholder for legacy data structure until full migration
const INITIAL_EVENTS: LandingEvent[] = [
  {
    id: 'initial-event-1',
    title: 'Bass Rebellion: Underground Series',
    description: "Dive deep into underground bass music with Indonesia's finest dubstep, drum & bass, and trap artists.",
    date: '2025-12-01',
    time: '22:00 - 05:00',
    venue: 'The Bunker',
    venueAddress: 'Jl. Kemang Raya, Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?auto=format&fit=crop&w=1200&q=80',
    category: 'Club Night',
    capacity: 1500,
    attendees: 1200,
    price: 'IDR 150K',
    price_range: 'IDR 150K',
    ticket_url: null,
    status: 'upcoming',
    artists: [
      { name: 'Bass Monkey', role: 'Headliner', image: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=400' },
    ],
    gallery: [],
    highlights: ['Underground warehouse venue', 'Heavy bass sound system'],
    start_date: '2025-12-01T22:00:00Z',
    end_date: '2025-12-02T05:00:00Z',
    location: 'The Bunker',
    partner_name: 'WildOut!',
    partner_logo_url: null,
    partner_website_url: 'https://wildout.id',
  },
];

const INITIAL_PARTNERS: PartnerDto[] = [
  {
    id: 'partner-1',
    name: 'Spotify',
    category: 'Music',
    status: 'active',
    website_url: 'https://spotify.com',
    description: 'Streaming partner',
    featured: true,
    social_links: { instagram: 'https://instagram.com/spotify' },
  },
];

const INITIAL_GALLERY: GalleryImageDto[] = [
  {
    id: 'gallery-1',
    url: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800',
    caption: 'Neon Nights Festival',
    uploadDate: '2025-10-28',
    event: 'Neon Nights',
  },
];

const INITIAL_TEAM: TeamMemberDto[] = [
  {
    id: 'team-1',
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    title: 'Founder & CEO',
    email: 'sarah@wildout.id',
    phone: '+62 812 3456 7890',
    bio: 'Visionary leader with 10+ years in nightlife and entertainment.',
    photoUrl: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400',
    status: 'active',
    social_links: { instagram: 'https://instagram.com/sarah' },
  },
];

const INITIAL_HERO: HeroContentDto = {
  title: 'WildOut!',
  subtitle: 'Media Digital Nightlife & Event Multi-Platform',
  description: "Indonesia's premier creative community connecting artists, events, and experiences.",
  stats: {
    events: '500+',
    members: '50K+',
    partners: '100+',
  },
  ctaText: 'Explore Events',
  ctaLink: '/events',
};

const INITIAL_ABOUT: AboutContentDto = {
  title: 'About WildOut!',
  subtitle: "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020.",
  foundedYear: '2020',
  story: [
    'Founded in 2020, WildOut! celebrates Indonesia�s creative culture.',
    'We host community-driven events that bring artists, venues, and sponsors together.',
  ],
  features: [
    { title: 'Community First', description: 'We build lasting connections.' },
    { title: 'Unforgettable Experiences', description: 'Every event is crafted to be memorable.' },
  ],
};

const INITIAL_SETTINGS: SiteSettingsDto = {
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
  updateTeamMember: (id: string, updates: TablesUpdate<'team_members'>, oldAvatarUrl?: string | null) => Promise<TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;
  // Partner mutations
  addPartner: (partner: TablesInsert<'partners'>) => Promise<Partner>;
  updatePartner: (id: string, updates: TablesUpdate<'partners'>, oldLogoUrl?: string | null) => Promise<Partner>;
  deletePartner: (id: string) => Promise<void>;
  // Gallery mutations
  addGalleryImage: (item: TablesInsert<'gallery_items'>) => Promise<GalleryImage>;
  updateGalleryImage: (id: string, updates: TablesUpdate<'gallery_items'>) => Promise<GalleryImage>;
  deleteGalleryImage: (id: string) => Promise<void>;
  // Content mutations
  saveHeroContent: (content: HeroContent) => Promise<void>;
  saveAboutContent: (content: AboutContent) => Promise<void>;
  saveSiteSettings: (settings: SiteSettings) => Promise<void>;
  // Admin sections
  adminSections: AdminSection[];
  sectionContent: Record<string, SectionContent>;
  adminSectionsLoading: boolean;
  getSectionContent: (sectionSlug: string) => SectionContent | null;
  getSectionPermissions: (sectionSlug: string) => SectionPermissions;
  updateSectionContent: (sectionSlug: string, content: any) => Promise<void>;
  // Dummy data control
  useDummyData: boolean;
  setUseDummyData: (use: boolean) => void;
}

type EventMetadata = Json extends infer T
  ? T extends object
    ? {
        highlights?: string[];
        gallery?: string[];
        featured_image?: string;
      } & Record<string, Json | undefined>
    : { highlights?: string[]; gallery?: string[]; featured_image?: string }
  : never;

const normalizeMetadata = (value: Json | null | undefined): EventMetadata => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as EventMetadata;
  }
  return {};
};

type DummyEvent = (typeof DUMMY_EVENTS)[number] & {
  attendees?: number | null;
  price?: string | null;
  partner_logo_url?: string | null;
  partner_website_url?: string | null;
};

 type PublicEventsViewRow = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  image?: string | null;
  banner_image?: string | null;
  category?: string | null;
  status?: string;
  max_attendees?: number | null;
  attendees?: number | null;
  price?: number | null;
  currency?: string | null;
  price_range?: string | null;
  ticket_url?: string | null;
  artists?: unknown[];
  gallery?: string[];
  highlights?: string[];
  partner_name?: string | null;
  partner_logo_url?: string | null;
  partner_website_url?: string | null;
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{
  children: ReactNode;
  useDummyData?: boolean;
}> = ({ children, useDummyData: initialUseDummyData = false }) => {
  // Get user authentication state
  const { user, role } = useAuth();

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

  // Admin sections state
  const [adminSections, setAdminSections] = useState<AdminSection[]>([]);
  const [sectionContent, setSectionContent] = useState<Record<string, SectionContent>>({});
  const [adminSectionsLoading, setAdminSectionsLoading] = useState(true);

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
          const dummyEvents: Event[] = DUMMY_EVENTS.map((event) => {
            const enrichedEvent = event as DummyEvent;
          const metadata = normalizeMetadata(enrichedEvent.metadata);
            const highlights = ensureStringArray(metadata.highlights);
            const galleryImages = ensureStringArray(metadata.gallery);

            return {
              id: event.id || `event-${Date.now()}-${Math.random()}`,
              title: event.title,
              description: event.description ?? null,
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
              image: metadata.featured_image || '',
              category: event.category ?? null,
              status: (event.status as Event['status']) || 'upcoming',
              capacity: event.capacity ?? null,
              attendees: enrichedEvent.attendees ?? null,
              price: enrichedEvent.price ?? enrichedEvent.price_range ?? null,
              price_range: enrichedEvent.price_range ?? null,
              ticket_url: event.ticket_url ?? null,
              artists: [],
              gallery: galleryImages,
              highlights,
              start_date: event.start_date,
              end_date: event.end_date,
              location: event.location ?? null,
              partner_name: event.partner_name ?? null,
              partner_logo_url: enrichedEvent.partner_logo_url ?? null,
              partner_website_url: enrichedEvent.partner_website_url ?? null,
              metadata,
              created_at: event.start_date,
              updated_at: event.end_date,
            };
          });

          // Set dummy data
          setEvents(dummyEvents);
          setPartners(
            DUMMY_PARTNERS.map(p => ({
              ...p,
              id: p.id || `partner-${Date.now()}-${Math.random()}`,
              category: null,
              website_url: p.website_url ?? null,
              status: (p.status as 'active' | 'inactive') || 'active',
              social_links: normalizeSocialLinks(p.social_links),
            }))
          );

          setGallery(
            DUMMY_GALLERY_ITEMS.map(g => {
              const imageUrls = ensureStringArray(g.image_urls) ?? [];
              return {
                id: g.id || `gallery-${Date.now()}-${Math.random()}`,
                title: g.title,
                description: g.description ?? null,
                category: g.category ?? null,
                status: g.status ?? 'published',
                tags: Array.isArray(g.tags) ? g.tags.filter((tag): tag is string => typeof tag === 'string') : [],
                image_urls: imageUrls,
                url: imageUrls[0] || '',
                created_at: g.created_at ?? new Date().toISOString(),
                updated_at: g.updated_at ?? new Date().toISOString(),
              };
            })
          );

          setTeam(
            DUMMY_TEAM_MEMBERS.map(t => ({
              ...t,
              id: t.id || `team-${Date.now()}-${Math.random()}`,
              role: null,
              phone: null,
              photoUrl: null,
              social_links: normalizeSocialLinks(t.social_links),
              status: (t.status as 'active' | 'inactive') || 'active',
            }))
          );

        } else {
          // Fetch all data concurrently from Supabase
          const [eventsData, partnersData, galleryData, teamData, heroData, aboutData, settingsData] = await Promise.all([
            fetchEvents(),
            fetchPartners(),
            fetchGallery(),
            fetchTeamMembers(),
            fetchHeroContent(),
            fetchAboutContent(),
            fetchSiteSettings(),
          ]);

          // Update state with fetched data
          setEvents(eventsData);
          setPartners(partnersData);
          setGallery(galleryData);
          setTeam(teamData);
          setHero(heroData);
          setAbout(aboutData);
          setSettings(settingsData);
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

  // Load admin sections and section content
  useEffect(() => {
    const loadAdminSections = async () => {
      try {
        setAdminSectionsLoading(true);

        // Fetch admin sections for the current user
        const { data: sections, error: sectionsError } = await supabaseClient
          .rpc('get_admin_sections_for_user', { user_id: user?.id });

        if (sectionsError) {
          console.error('Error fetching admin sections:', sectionsError);
          // Fallback to hardcoded sections if RPC fails
          setAdminSections([
            {
              id: 'home-id',
              slug: 'home',
              label: 'Dashboard',
              icon: 'LayoutDashboard',
              category: 'main',
              order_index: 1,
              enabled: true,
              description: 'Overview dashboard with statistics and recent activity',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'hero-id',
              slug: 'hero',
              label: 'Hero Section',
              icon: 'Sparkles',
              category: 'content',
              order_index: 2,
              enabled: true,
              description: 'Landing page hero section with title, subtitle, and call-to-action',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'about-id',
              slug: 'about',
              label: 'About Us',
              icon: 'Info',
              category: 'content',
              order_index: 3,
              enabled: true,
              description: 'About page content including story and features',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'events-id',
              slug: 'events',
              label: 'Events',
              icon: 'Calendar',
              category: 'content',
              order_index: 4,
              enabled: true,
              description: 'Manage events, categories, and event details',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'team-id',
              slug: 'team',
              label: 'Team',
              icon: 'Users',
              category: 'content',
              order_index: 5,
              enabled: true,
              description: 'Team members and their information',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'gallery-id',
              slug: 'gallery',
              label: 'Gallery',
              icon: 'Image',
              category: 'content',
              order_index: 6,
              enabled: true,
              description: 'Image gallery items and management',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'partners-id',
              slug: 'partners',
              label: 'Partners',
              icon: 'Handshake',
              category: 'content',
              order_index: 7,
              enabled: true,
              description: 'Partner organizations and collaborations',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'settings-id',
              slug: 'settings',
              label: 'Settings',
              icon: 'Settings',
              category: 'management',
              order_index: 8,
              enabled: true,
              description: 'Site-wide settings and configuration',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            }
          ]);
        } else {
          setAdminSections(sections || []);
        }

        // Fetch section content for all sections
        const contentMap: Record<string, SectionContent> = {};

        // For sections with dynamic content (home), fetch from section_content table
        const sectionsWithContent = ['home', 'events', 'team', 'gallery', 'partners', 'settings'];

        for (const sectionSlug of sectionsWithContent) {
          try {
            const { data: content, error: contentError } = await supabaseClient
              .rpc('get_section_content', { section_slug: sectionSlug, user_id: user?.id });

            if (!contentError && content && content.length > 0) {
              contentMap[sectionSlug] = content[0];
            }
          } catch (err) {
            console.warn(`Failed to fetch content for section ${sectionSlug}:`, err);
          }
        }

        setSectionContent(contentMap);

      } catch (error) {
        console.error('Error loading admin sections:', error);
        // Keep admin sections as fallback data
      } finally {
        setAdminSectionsLoading(false);
      }
    };

    loadAdminSections();
  }, []);

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

  // Content Mutations
  const saveHeroContent = async (content: HeroContent): Promise<void> => {
    try {
      setError(null);

      console.log('🔄 Starting saveHeroContent with data:', content);

      // Check authentication using AuthContext
      if (!user) {
        console.error('❌ No authenticated user');
        throw new Error('User not authenticated');
      }

      console.log('✅ Authenticated user:', user.id, user.email);

      // Check user role from AuthContext
      if (role !== 'admin') {
        console.error('❌ Insufficient permissions. User role:', role);
        throw new Error(`Insufficient permissions. User role: ${role}`);
      }

      console.log('✅ User has admin role:', role);

      const saveData = {
        id: '00000000-0000-0000-0000-000000000001', // Fixed ID for singleton
        title: content.title,
        subtitle: content.subtitle,
        description: content.description,
        stats: content.stats,
        cta_text: content.ctaText,
        cta_link: content.ctaLink,
        updated_at: new Date().toISOString()
        // updated_by will be set automatically by trigger
      };

      console.log('📤 Saving data:', saveData);

      const { error } = await supabaseClient
        .from('hero_content')
        .upsert(saveData);

      if (error) {
        console.error('❌ Database error:', error);
        setError(`Failed to save hero content: ${error.message}`);
        throw error;
      }

      console.log('✅ Save successful');

      // Optimistically update local state
      setHero(content);
    } catch (err) {
      console.error('❌ Error in saveHeroContent:', err);
      setError(`Failed to save hero content: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const saveAboutContent = async (content: AboutContent): Promise<void> => {
    try {
      setError(null);

      console.log('🔄 Starting saveAboutContent with data:', content);

      // Check authentication using AuthContext
      if (!user) {
        console.error('❌ No authenticated user');
        throw new Error('User not authenticated');
      }

      console.log('✅ Authenticated user:', user.id, user.email);

      // Check user role from AuthContext
      if (role !== 'admin') {
        console.error('❌ Insufficient permissions. User role:', role);
        throw new Error(`Insufficient permissions. User role: ${role}`);
      }

      console.log('✅ User has admin role:', role);

      const saveData = {
        id: '00000000-0000-0000-0000-000000000002', // Fixed ID for singleton
        title: content.title,
        subtitle: content.subtitle,
        founded_year: content.foundedYear,
        story: content.story,
        features: content.features,
        updated_at: new Date().toISOString()
        // updated_by will be set automatically by trigger
      };

      console.log('📤 Saving data:', saveData);

      const { error } = await supabaseClient
        .from('about_content')
        .upsert(saveData);

      if (error) {
        console.error('❌ Database error:', error);
        setError(`Failed to save about content: ${error.message}`);
        throw error;
      }

      console.log('✅ Save successful');

      // Optimistically update local state
      setAbout(content);
    } catch (err) {
      console.error('❌ Error in saveAboutContent:', err);
      setError(`Failed to save about content: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
    try {
      setError(null);

      console.log('🔄 Starting saveSiteSettings with data:', settings);

      // Check authentication using AuthContext
      if (!user) {
        console.error('❌ No authenticated user');
        throw new Error('User not authenticated');
      }

      console.log('✅ Authenticated user:', user.id, user.email);

      // Check user role from AuthContext
      if (role !== 'admin') {
        console.error('❌ Insufficient permissions. User role:', role);
        throw new Error(`Insufficient permissions. User role: ${role}`);
      }

      console.log('✅ User has admin role:', role);

      const saveData = {
        id: '00000000-0000-0000-0000-000000000003', // Fixed ID for singleton
        site_name: settings.siteName,
        site_description: settings.siteDescription,
        tagline: settings.tagline,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        social_media: settings.socialMedia,
        updated_at: new Date().toISOString()
        // updated_by will be set automatically by trigger
      };

      console.log('📤 Saving data:', saveData);

      const { error } = await supabaseClient
        .from('site_settings')
        .upsert(saveData);

      if (error) {
        console.error('❌ Database error:', error);
        setError(`Failed to save site settings: ${error.message}`);
        throw error;
      }

      console.log('✅ Save successful');

      // Optimistically update local state
      setSettings(settings);
    } catch (err) {
      console.error('❌ Error in saveSiteSettings:', err);
      setError(`Failed to save site settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  // Admin section helper functions
  const getSectionContent = (sectionSlug: string): SectionContent | null => {
    return sectionContent[sectionSlug] || null;
  };

  const getSectionPermissions = (sectionSlug: string): SectionPermissions => {
    // For now, return full permissions for all users (will be enhanced with RBAC later)
    // TODO: Implement actual RBAC checking based on user role and permissions
    return {
      canView: true,
      canEdit: true,
      canPublish: true,
      canDelete: true,
    };
  };

  const updateSectionContent = async (sectionSlug: string, content: any): Promise<void> => {
    try {
      setError(null);

      const { data, error } = await supabaseClient
        .rpc('update_section_content', {
          section_slug: sectionSlug,
          new_payload: content
        });

      if (error) {
        console.error('Error updating section content:', error);
        setError(`Failed to update section content: ${error.message}`);
        throw error;
      }

      // Optimistically update local state
      setSectionContent(prev => ({
        ...prev,
        [sectionSlug]: {
          ...prev[sectionSlug],
          payload: content,
          updated_at: new Date().toISOString()
        }
      }));

    } catch (err) {
      console.error('Error in updateSectionContent:', err);
      setError('Failed to update section content');
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
    // Content mutations
    saveHeroContent,
    saveAboutContent,
    saveSiteSettings,
    // Admin sections
    adminSections,
    sectionContent,
    adminSectionsLoading,
    getSectionContent,
    getSectionPermissions,
    updateSectionContent,
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
