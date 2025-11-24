// Use GENERATED Supabase types
import type { Json, TablesInsert, TablesUpdate } from '../supabase/types';

export type { TablesInsert, TablesUpdate };

export interface HeroStats {
  events: string;
  members: string;
  partners: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  stats: HeroStats;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  featuredEventId?: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface AboutContent {
  title: string;
  subtitle: string;
  story: string[];
  foundedYear: string;
  features: Feature[];
}

export interface GalleryImage {
  id: string;
  title?: string;
  description?: string | null;
  url?: string;
  image_urls?: string[];
  category?: string | null;
  status?: string;
  tags?: string[];
  caption?: string;
  uploadDate?: string;
  event_id?: string | null;
  event?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventArtist {
  name: string;
  role?: string;
  image?: string;
  id?: string;
  event_id?: string;
  performance_time?: string | null;
}

// RENAMED: LandingEvent to avoid DOM Event clash
export interface LandingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  venue: string;
  venueAddress: string;
  image: string;
  category?: string | null;
  capacity?: number | null;
  attendees?: number | null;
  price?: string | null;
  price_range?: string | null;
  ticket_url?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  artists: EventArtist[];
  gallery?: string[];
  highlights?: string[];
  start_date: string;
  end_date: string;
  location?: string | null;
  partner_name?: string | null;
  partner_logo_url?: string | null;
  partner_website_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export type Event = LandingEvent;

export interface PublicEventsViewRow {
  id: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  start_date: string;
  end_date?: string | null;
  location?: string | null;
  image?: string | null;
  banner_image?: string | null;
  category?: string | null;
  status: string;
  capacity?: number | null;
  max_attendees?: number | null;
  attendees?: number | null;
  price?: string | null;
  currency?: string | null;
  price_range?: string | null;
  ticket_url?: string | null;
  artists: string[];
  gallery: string[];
  highlights: string[];
  partner_name?: string | null;
  partner_logo_url?: string | null;
  partner_website_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

// Canonical types for landing
export interface TeamMember {
  id: string;
  name: string;
  title?: string | null | undefined;
  role?: string | null | undefined;
  bio?: string | null | undefined;
  photoUrl?: string | null | undefined;
  avatar_url?: string | null | undefined;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  status?: 'active' | 'inactive' | undefined;
  social_links?: Record<string, string | null> | null;
  display_order?: number | null | undefined;
  created_at?: string;
  updated_at?: string;
}

export interface Partner {
  id: string;
  name: string;
  description?: string | null | undefined;
  logo_url?: string | null | undefined;
  website_url?: string | null | undefined;
  category?: string | null | undefined;
  status?: 'active' | 'inactive' | undefined;
  featured?: boolean | null | undefined;
  contact_email?: string | null | undefined;
  contact_phone?: string | null | undefined;
  social_links?: Record<string, string | null> | null;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription?: string | undefined;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  socialMedia: Record<string, string>;
}

// Admin Types
export type AdminSection = {
  id: string;
  slug: string;
  label: string;
  icon: string;
  category: string;
  order_index: number;
  enabled: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
};

export type SectionContent = {
  id: string;
  section_id: string;
  payload: Json;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
};

export type SectionPermissions = {
  canView: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

export interface ContentContextType {
  events: LandingEvent[];
  partners: Partner[];
  gallery: GalleryImage[];
  team: TeamMember[];
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
  updateEvents: React.Dispatch<React.SetStateAction<LandingEvent[]>>;
  updatePartners: React.Dispatch<React.SetStateAction<Partner[]>>;
  updateGallery: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
  updateTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  updateHero: React.Dispatch<React.SetStateAction<HeroContent>>;
  updateAbout: React.Dispatch<React.SetStateAction<AboutContent>>;
  updateSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  loading: boolean;
  error: string | null;
  useDummyData: boolean;
  setUseDummyData: React.Dispatch<React.SetStateAction<boolean>>;
  addEvent: (event: TablesInsert<'events'>) => Promise<LandingEvent>;
  updateEvent: (id: string, updates: TablesUpdate<'events'>) => Promise<LandingEvent>;
  deleteEvent: (id: string) => Promise<void>;
  addTeamMember: (member: TablesInsert<'team_members'>) => Promise<TeamMember>;
  updateTeamMember: (id: string, updates: TablesUpdate<'team_members'>, oldAvatarUrl?: string | null) => Promise<TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;
  addPartner: (partner: TablesInsert<'partners'>) => Promise<Partner>;
  updatePartner: (id: string, updates: TablesUpdate<'partners'>, oldLogoUrl?: string | null) => Promise<Partner>;
  deletePartner: (id: string) => Promise<void>;
  addGalleryImage: (item: TablesInsert<'gallery_items'>) => Promise<GalleryImage>;
  updateGalleryImage: (id: string, updates: TablesUpdate<'gallery_items'>, oldImageUrl?: string | null) => Promise<GalleryImage>;
  deleteGalleryImage: (id: string) => Promise<void>;
  fetchEventArtists: (eventId: string) => Promise<EventArtist[]>;
  addEventArtist: (artist: TablesInsert<'event_artists'>) => Promise<EventArtist>;
  updateEventArtist: (id: string, updates: TablesUpdate<'event_artists'>) => Promise<EventArtist>;
  deleteEventArtist: (id: string) => Promise<void>;
  saveHeroContent: (content: HeroContent) => Promise<void>;
  saveAboutContent: (content: AboutContent) => Promise<void>;
  saveSiteSettings: (settings: SiteSettings) => Promise<void>;
  adminSections: AdminSection[];
  sectionContent: Record<string, SectionContent>;
  adminSectionsLoading: boolean;
  getSectionContent: (sectionSlug: string) => SectionContent | null;
  getSectionPermissions: (sectionSlug: string) => SectionPermissions;
  updateSectionContent: (sectionSlug: string, content: Json) => Promise<void>;
}
