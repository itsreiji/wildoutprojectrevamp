/* @refresh reset */
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabaseClient } from '../supabase/client';
import { useAuth } from './AuthContext';
import type { AuthRole } from './AuthContext';
import type { Json, TablesInsert, TablesUpdate } from '../supabase/types';
import { DUMMY_EVENTS, DUMMY_TEAM_MEMBERS, DUMMY_PARTNERS, DUMMY_GALLERY_ITEMS } from '../data/dummyData';
import { cleanupEventAssets, cleanupTeamMemberAsset, cleanupPartnerAsset, cleanupGalleryAsset } from '../utils/storageHelpers';
import type {
  TeamMember,
  Partner,
  HeroContent,
  AboutContent,
  GalleryImage,
  SiteSettings,
  PublicEventsViewRow,
  ContentContextType,
  AdminSection,
  SectionContent,
  SectionPermissions,
  LandingEvent,
  EventArtist
} from '@/types/content';

const normalizeSocialLinks = (value: Json | undefined): Record<string, string | null> => {
  if (!value || typeof value === 'string') return {};
  if (Array.isArray(value)) return {};
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

interface DummyEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  category?: string;
  capacity?: number;
  attendees?: number;
  price?: string;
  price_range?: string;
  ticket_url?: string;
  partner_name?: string;
  partner_logo_url?: string;
  metadata?: Record<string, unknown>;
  status?: string;
  image?: string;
}

const normalizeMetadata = (metadata: Json | null | undefined): Record<string, unknown> => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
};

// Initial data aligned with new types
const INITIAL_EVENTS: LandingEvent[] = [];
const INITIAL_PARTNERS: Partner[] = [];
const INITIAL_GALLERY: GalleryImage[] = [];
const INITIAL_TEAM: TeamMember[] = [];
const INITIAL_HERO: HeroContent = {
  title: 'WildOut!',
  subtitle: 'Media Digital Nightlife & Event Multi-Platform',
  description: "Indonesia's premier creative community connecting artists, events, and experiences.",
  stats: { events: '500+', members: '50K+', partners: '100+' },
};
const INITIAL_ABOUT: AboutContent = {
  title: 'About WildOut!',
  subtitle: "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020.",
  foundedYear: '2020',
  story: [
    'Founded in 2020, WildOut! celebrates Indonesia’s creative culture.',
    'We host community-driven events that bring artists, venues, and sponsors together.',
  ],
  features: [
    { title: 'Community First', description: 'We build lasting connections.' },
    { title: 'Unforgettable Experiences', description: 'Every event is crafted to be memorable.' },
  ],
};
const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'WildOut!',
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

// Fetch functions using content.ts types
const fetchHeroContent = async (): Promise<HeroContent> => {
  try {
    const { data, error } = await supabaseClient.rpc('get_hero_content');
    if (error) {
      console.error('Error fetching hero content:', error);
      return INITIAL_HERO;
    }
    const result = data?.[0];
    if (result) {
      return {
        title: result.title ?? INITIAL_HERO.title,
        subtitle: result.subtitle ?? INITIAL_HERO.subtitle,
        description: result.description ?? INITIAL_HERO.description,
        stats: typeof result.stats === 'string' ? JSON.parse(result.stats) ?? INITIAL_HERO.stats : (result.stats ?? INITIAL_HERO.stats),
        ctaText: result.cta_text ?? INITIAL_HERO.ctaText,
        ctaLink: result.cta_link ?? INITIAL_HERO.ctaLink,
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
    const result = data?.[0];
    if (result) {
      return {
        title: result.title ?? INITIAL_ABOUT.title,
        subtitle: result.subtitle ?? INITIAL_ABOUT.subtitle,
        foundedYear: result.founded_year ?? INITIAL_ABOUT.foundedYear,
        story: ensureStringArray(result.story) ?? INITIAL_ABOUT.story,
        features: typeof result.features === 'string' ? JSON.parse(result.features) ?? INITIAL_ABOUT.features : (result.features ?? INITIAL_ABOUT.features),
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
    const result = data?.[0];
    if (result) {
      return {
        siteName: result.site_name ?? INITIAL_SETTINGS.siteName,
        siteDescription: result.site_description ?? INITIAL_SETTINGS.siteDescription,
        tagline: result.tagline ?? INITIAL_SETTINGS.tagline,
        email: result.email ?? INITIAL_SETTINGS.email,
        phone: result.phone ?? INITIAL_SETTINGS.phone,
        address: result.address ?? INITIAL_SETTINGS.address,
        socialMedia: normalizeSocialLinks(result.social_media) as Record<string, string>,
      };
    }
    return INITIAL_SETTINGS;
  } catch (error) {
    console.error('Error in fetchSiteSettings:', error);
    return INITIAL_SETTINGS;
  }
};

const fetchEvents = async (): Promise<LandingEvent[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('public_events_view')
      .select('*')
      .order('start_date', { ascending: true });
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    return (data || []).map((row: any): LandingEvent => {
      // Map database status to LandingEvent status
      let status: LandingEvent['status'] = 'upcoming';
      if (row.status === 'published') {
        // Check if event is ongoing or upcoming based on dates
        const now = new Date();
        const startDate = row.start_date ? new Date(row.start_date) : null;
        const endDate = row.end_date ? new Date(row.end_date) : null;
        if (startDate && endDate && now >= startDate && now <= endDate) {
          status = 'ongoing';
        } else if (endDate && now > endDate) {
          status = 'completed';
        } else {
          status = 'upcoming';
        }
      } else if (row.status === 'ongoing') {
        status = 'ongoing';
      } else if (row.status === 'completed' || row.status === 'cancelled' || row.status === 'archived') {
        status = 'completed';
      }
      
      return {
      id: row.id ?? '',
      title: row.title ?? '',
      description: row.description ?? null,
      date: row.date ?? row.start_date ?? '',
      time: row.time ?? '',
      venue: row.venue ?? row.location ?? '',
      venueAddress: row.venue_address ?? row.address ?? '',
      image: row.image ?? row.image_url ?? row.featured_image ?? '',
      category: row.category ?? null,
      status,
      end_date: row.end_date ?? '',
      capacity: row.capacity || row.max_attendees || undefined,
      attendees: row.attendees || row.current_attendees || null,
      price: (() => {
        // Use price_range from metadata if available, otherwise construct from price/currency
        const metadata = row.metadata || {};
        if (metadata.price_range) {
          return metadata.price_range;
        }
        if (row.price) {
          return `${row.currency || 'IDR'} ${row.price}`;
        }
        return null;
      })(),
      price_range: (() => {
        // Extract price_range from metadata if available
        const metadata = row.metadata || {};
        if (metadata.price_range) {
          return metadata.price_range;
        }
        return row.price_range || null;
      })(),
      ticket_url: row.ticket_url || null,
      artists: (() => {
        // Extract artists from metadata if available
        const metadata = row.metadata || {};
        if (metadata.artists && Array.isArray(metadata.artists)) {
          return metadata.artists.map((artist: any): EventArtist => ({
            name: artist.name || artist || '',
            role: artist.role || undefined,
            image: artist.image || undefined,
          }));
        }
        // Fallback to row.artists if it's an array of strings
        if (row.artists && Array.isArray(row.artists)) {
          return row.artists.map((name: string): EventArtist => ({ 
            name: typeof name === 'string' ? name : '', 
            role: undefined, 
            image: undefined 
          }));
        }
        return [];
      })(),
      gallery: (() => {
        // Extract gallery images from gallery_images_urls if available
        if (row.gallery_images_urls) {
          try {
            // If it's already an array, use it directly
            if (Array.isArray(row.gallery_images_urls)) {
              return row.gallery_images_urls;
            }
            // If it's a JSON string, parse it
            if (typeof row.gallery_images_urls === 'string') {
              return JSON.parse(row.gallery_images_urls);
            }
            // If it's a JSONB object, it might already be parsed
            return row.gallery_images_urls;
          } catch (e) {
            console.error('Error parsing gallery_images_urls:', e);
          }
        }
        // Fallback to row.gallery if available
        return row.gallery || [];
      })(),
      highlights: (() => {
        // Extract highlights from metadata if available
        const metadata = row.metadata || {};
        if (metadata.highlights && Array.isArray(metadata.highlights)) {
          return metadata.highlights;
        }
        return row.highlights || [];
      })(),
      start_date: row.start_date,
      location: row.location || null,
      partner_name: row.partner_name || null,
      partner_logo_url: row.partner_logo_url || null,
      partner_website_url: row.partner_website_url || null,
      metadata: row.metadata ?? {},
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
    }) as LandingEvent[];
  } catch (error) {
    console.error('Error in fetchEvents:', error);
    return [];
  }
};

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
      return INITIAL_TEAM;
    }
    return (data || []).map((row: any): TeamMember => ({
      id: row.id,
      name: row.name || '',
      title: row.title || row.role || undefined,
      bio: row.bio || undefined,
      photoUrl: row.avatar_url || undefined,
      email: row.email || undefined,
      status: row.status as 'active' | 'inactive' | undefined || undefined,
      social_links: normalizeSocialLinks(row.social_links),
      display_order: row.display_order || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (error) {
    console.error('Error in fetchTeamMembers:', error);
    return INITIAL_TEAM;
  }
};

const fetchPartners = async (): Promise<Partner[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('partners')
      .select('*')
      .eq('status', 'active')
      .order('name');
    if (error) {
      console.error('Error fetching partners:', error);
      return INITIAL_PARTNERS;
    }
    return (data || []).map((row: any): Partner => ({
      id: row.id,
      name: row.name || '',
      description: row.description || undefined,
      logo_url: row.logo_url || undefined,
      website_url: row.website_url || undefined,
      category: row.category || undefined,
      status: row.status as 'active' | 'inactive' | undefined || undefined,
      featured: row.featured || undefined,
      contact_email: row.contact_email || undefined,
      contact_phone: row.contact_phone || undefined,
      social_links: normalizeSocialLinks(row.social_links),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (error) {
    console.error('Error in fetchPartners:', error);
    return INITIAL_PARTNERS;
  }
};

const fetchGallery = async (): Promise<GalleryImage[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('gallery_items')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching gallery:', error);
      return INITIAL_GALLERY;
    }
    return (data || []).map((row: any): GalleryImage => ({
      id: row.id,
      title: row.title || undefined,
      description: row.description || undefined,
      url: row.image_url || undefined,
      image_urls: row.image_urls ? JSON.parse(row.image_urls) as string[] : undefined,
      category: row.category || undefined,
      status: row.status || undefined,
      tags: row.tags || undefined,
      caption: row.title || undefined,
      uploadDate: row.created_at || undefined,
      event: row.event_title || undefined,
      created_at: row.created_at || undefined,
      updated_at: row.updated_at || undefined,
    }));
  } catch (error) {
    console.error('Error in fetchGallery:', error);
    return INITIAL_GALLERY;
  }
};

// ContentContext
const ContentContext = createContext<ContentContextType | undefined>(undefined);

// ContentProvider
export const ContentProvider: React.FC<{ children: ReactNode; useDummyData?: boolean }> = ({ 
  children, 
  useDummyData: initialUseDummyData = false 
}) => {
  const authContext = useAuth();
  const user = authContext.user;
  const role: AuthRole = authContext.role;

  // ALL useState FIRST with content.ts types
  const [events, setEvents] = useState<LandingEvent[]>(INITIAL_EVENTS);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
  const [about, setAbout] = useState<AboutContent>(INITIAL_ABOUT);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [adminSections, setAdminSections] = useState<AdminSection[]>([]);
  const [sectionContent, setSectionContent] = useState<Record<string, SectionContent>>({});
  const [adminSectionsLoading, setAdminSectionsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDummyData, setUseDummyData] = useState<boolean>(initialUseDummyData);

  // NOW useEffects and functions (useDummyData in scope)
  // useEffect loadData (keep existing, but ensure useDummyData reference is correct)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (useDummyData) {
          // Use dummy data for development/testing
          console.log('🔧 Using dummy data for development');

          // Transform dummy events to match Event type
          const dummyEvents: LandingEvent[] = DUMMY_EVENTS.map((event: any) => {
            const metadata = normalizeMetadata(event.metadata);
            const highlights = ensureStringArray(metadata.highlights as Json) ?? [];
            const galleryImages = ensureStringArray(metadata.gallery as Json) ?? [];
            return {
              id: event.id ?? `dummy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: event.title ?? '',
              description: event.description ?? null,
              date: event.start_date ? event.start_date.split('T')[0] : '',
              time: event.start_date ? new Date(event.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
              venue: event.location ?? '',
              venueAddress: event.location ?? '',
              image: (metadata.image as string) ?? '',
              category: event.category ?? null,
              status: (event.status as LandingEvent['status']) ?? 'upcoming',
              end_date: event.end_date ?? '',
              capacity: event.capacity ?? undefined,
              attendees: null,
              price: null,
              price_range: event.price_range ?? null,
              ticket_url: event.ticket_url ?? null,
              artists: [],
              gallery: galleryImages,
              highlights,
              start_date: event.start_date ?? '',
              location: event.location ?? null,
              partner_name: event.partner_name ?? null,
              partner_logo_url: null,
              partner_website_url: null,
              metadata,
              created_at: event.created_at ?? event.start_date ?? new Date().toISOString(),
              updated_at: event.updated_at ?? event.end_date ?? new Date().toISOString(),
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
          try {
            const eventsData = await fetchEvents();
          setEvents(eventsData);
          } catch (e) {
            console.error('Events fetch failed:', e);
          }

          try {
            const partnersData = await fetchPartners();
          setPartners(partnersData);
          } catch (e) {
            console.error('Partners fetch failed:', e);
          }

          try {
            const galleryData = await fetchGallery();
          setGallery(galleryData);
          } catch (e) {
            console.error('Gallery fetch failed:', e);
          }

          try {
            const teamData = await fetchTeamMembers();
          setTeam(teamData);
          } catch (e) {
            console.error('Team fetch failed:', e);
          }

          try {
            const heroData = await fetchHeroContent();
          setHero(heroData);
          } catch (e) {
            console.error('Hero fetch failed:', e);
          }

          try {
            const aboutData = await fetchAboutContent();
          setAbout(aboutData);
          } catch (e) {
            console.error('About fetch failed:', e);
          }

          try {
            const settingsData = await fetchSiteSettings();
          setSettings(settingsData);
          } catch (e) {
            console.error('Settings fetch failed:', e);
          }
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
  }, [useDummyData]);  // Safe reference

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

  // ALL mutations as const functions inside component
  const addEvent = async (event: TablesInsert<'events'>): Promise<LandingEvent> => {
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
        const newEvent: LandingEvent = {
          ...data,
          date: data.start_date.split('T')[0],
          time: `${new Date(data.start_date || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(data.end_date || data.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          venue: data.location || 'TBD',
          venueAddress: data.location || '',
          category: data.category || null,
          status: data.status as 'upcoming' | 'ongoing' | 'completed',
          capacity: data.capacity || data.max_attendees || undefined,
          price: data.price ? `${data.currency || 'IDR'} ${data.price}` : null,
          price_range: data.price_range || null,
          ticket_url: data.ticket_url || null,
          artists: [], // Placeholder, will be fetched from DUMMY_EVENT_ARTISTS
          gallery: [], // Placeholder, will be fetched from DUMMY_GALLERY_ITEMS
          highlights: [], // Placeholder, will be fetched from DUMMY_EVENTS
          start_date: data.start_date,
          end_date: data.end_date || undefined,
          location: data.location || null,
          partner_name: data.partner_name || null,
          partner_logo_url: null, // Placeholder, will be fetched from DUMMY_PARTNERS
          partner_website_url: null, // Placeholder, will be fetched from DUMMY_PARTNERS
          metadata: {}, // Placeholder, will be fetched from DUMMY_EVENTS
          created_at: data.start_date,
          updated_at: data.end_date || undefined,
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

  const updateEvent = async (id: string, updates: TablesUpdate<'events'>): Promise<LandingEvent> => {
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
        const updatedEvent: LandingEvent = {
          ...data,
          date: data.start_date.split('T')[0],
          time: `${new Date(data.start_date || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(data.end_date || data.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          venue: data.location || 'TBD',
          venueAddress: data.location || '',
          category: data.category || null,
          status: data.status as 'upcoming' | 'ongoing' | 'completed',
          capacity: data.capacity || data.max_attendees || undefined,
          price: data.price ? `${data.currency || 'IDR'} ${data.price}` : null,
          price_range: data.price_range || null,
          ticket_url: data.ticket_url || null,
          artists: [], // Placeholder, will be fetched from DUMMY_EVENT_ARTISTS
          gallery: [], // Placeholder, will be fetched from DUMMY_GALLERY_ITEMS
          highlights: [], // Placeholder, will be fetched from DUMMY_EVENTS
          start_date: data.start_date,
          end_date: data.end_date || undefined,
          location: data.location || null,
          partner_name: data.partner_name || null,
          partner_logo_url: null, // Placeholder, will be fetched from DUMMY_PARTNERS
          partner_website_url: null, // Placeholder, will be fetched from DUMMY_PARTNERS
          metadata: {}, // Placeholder, will be fetched from DUMMY_EVENTS
          created_at: data.start_date,
          updated_at: data.end_date || undefined,
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

  const value: ContentContextType = {
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
  if (!context) throw new Error('useContent must be within ContentProvider');
  return context;
};
