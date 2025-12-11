// Content types for the WildOut! project

import { Json, TablesInsert, TablesUpdate } from './supabase';

export interface TeamMember {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  status: string; // Adjusted to string to match DB more closely, will map to 'active' | 'inactive' in provider
  social_links: Json | null; // Use Json type
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  category: string | null;
  status: string; // Adjusted to string to match DB more closely
  contact_email: string | null;
  contact_phone: string | null;
  social_links: Json | null; // Use Json type
  created_at: string | null;
  updated_at: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}

export interface HeroContent {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  stats: Json | null; // Use Json type for stats
  cta_text: string | null;
  cta_link: string | null;
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export interface AboutContent {
  id: string;
  title: string;
  subtitle: string | null;
  founded_year: string | null;
  story: string[] | null;
  features: Json | null; // Use Json type for features
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  category: string | null;
  status: string | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  display_order: number | null;
  event_id: string | null;
  metadata: Json | null; // Use Json type
  partner_id: string | null;
  thumbnail_url: string | null;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  social_media: Json | null; // Use Json type
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export interface ContentContextType {
  events: LandingEvent[];
  partners: Partner[];
  gallery: GalleryImage[];
  team: TeamMember[];
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  // Event mutations
  addEvent: (event: TablesInsert<'events'>) => Promise<LandingEvent>;
  updateEvent: (id: string, updates: TablesUpdate<'events'>) => Promise<LandingEvent>;
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
  addGalleryImage: (image: TablesInsert<'gallery_items'>) => Promise<GalleryImage>;
  updateGalleryImage: (id: string, updates: TablesUpdate<'gallery_items'>) => Promise<GalleryImage>;
  deleteGalleryImage: (id: string) => Promise<void>;
  // Event Artists mutations
  fetchEventArtists: (eventId: string) => Promise<EventArtist[]>;
  addEventArtist: (artist: Omit<EventArtist, 'id' | 'created_at' | 'updated_at'>) => Promise<EventArtist>;
  updateEventArtist: (id: string, updates: Partial<Omit<EventArtist, 'id' | 'created_at' | 'updated_at'>>) => Promise<EventArtist>;
  deleteEventArtist: (id: string) => Promise<void>;
  // Content mutations
  saveHeroContent: (content: HeroContent) => Promise<HeroContent>;
  saveAboutContent: (content: AboutContent) => Promise<AboutContent>;
  saveSiteSettings: (settings: SiteSettings) => Promise<SiteSettings>;
  // Admin sections
  adminSections: AdminSection[];
  sectionContent: Record<string, SectionContent>;
  adminSectionsLoading: boolean;
  getSectionContent: (sectionId: string) => SectionContent | null;
  getSectionPermissions: (sectionId: string) => SectionPermissions[];
  updateSectionContent: (sectionId: string, content: SectionContent) => Promise<SectionContent>;
}

export interface AdminSection {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  order_index: number;
  icon: string;
  category: string;
  // Removed display_name, name, enabled, created_at, updated_at, permissions as they are not directly from RPC
}

export interface SectionContent {
  payload: Json | null; // Changed to Json | null
  updated_at: string | null;
  updated_by: string | null;
  version: number;
}

export interface SectionPermissions {
  can_view: boolean | null;
  can_edit: boolean | null;
  can_publish: boolean | null;
  can_delete: boolean | null;
}

export interface LandingEvent {
  id: string | null;
  title: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  time: string | null; // Added time
  location: string | null;
  category: string | null;
  status: string | null; // Adjusted to string to match DB
  capacity: number | null;
  attendees: number | null;
  currency: string | null;
  price: number | null;
  price_range: string | null;
  artists: Json | null; // Use Json type
  gallery: Json | null; // Use Json type
  highlights: Json | null; // Use Json type
  metadata: Json | null; // Use Json type
  created_at: string | null;
  updated_at: string | null;
  tags: string[] | null;
  image_url: string | null;
  partner_name: string | null;
  partner_logo_url: string | null;
  ticket_url: string | null; // Added ticket_url
  image: string | null; // Added image (from public_events_view)
}

export interface EventArtist {
  id: string;
  event_id: string;
  name: string;
  role: string | null;
  image: string | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// Keeping PublicEventsViewRow for reference if needed, but the LandingEvent type will be used for mapping.
export interface PublicEventsViewRow {
  artists: Json | null;
  attendees: number | null;
  capacity: number | null;
  category: string | null;
  created_at: string | null;
  currency: string | null;
  description: string | null;
  end_date: string | null;
  gallery: Json | null;
  highlights: Json | null;
  id: string | null;
  image: string | null;
  image_url: string | null;
  location: string | null;
  metadata: Json | null;
  partner_logo_url: string | null;
  partner_name: string | null;
  price: number | null;
  price_range: string | null;
  short_description: string | null;
  start_date: string | null;
  status: string | null;
  tags: string[] | null;
  ticket_url: string | null;
  title: string | null;
  updated_at: string | null;
}
