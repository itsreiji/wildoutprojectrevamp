import type { Database, Json } from '../supabase/types';

export type { TablesInsert, TablesUpdate } from '../supabase/types';

// Missing types for other components
// Partner from Supabase - Custom interface to fix property names
export interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  category: string;
  status: string;
  featured?: boolean;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  social_links?: Record<string, string | null>;
  social_media?: Record<string, string | null>;
  created_at?: string | null;
  updated_at?: string | null;
}

// TeamMember from Supabase - Custom interface to fix property names
export interface SocialLinks {
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  [key: string]: string | null | undefined;
}

export interface TeamMemberMetadata {
  social_links?: SocialLinks;
  [key: string]: string | null | undefined | SocialLinks | undefined;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  photo_url_link?: string | null;
  email: string | null;
  status?: string;
  linkedin_url?: string | null;
  metadata?: TeamMemberMetadata | null;
  social_links?: SocialLinks; // For backward compatibility
  display_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Missing type for AllEventsPage
export interface LandingEvent {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  status: string;
  tags: string[] | null;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  price: number | null;
  currency: string | null;
  partner_name: string | null;
  partner_logo_url: string | null;
  time?: string;
  capacity?: number | null;
  attendees?: number | null;
  price_range?: string | null;
  artists?: Json;
  gallery?: Json;
  highlights?: Json[];
  metadata?: Json;
  ticket_url?: string | null;
  // Additional properties used by components
  date?: string | null;
  venue?: string | null;
  venueAddress?: string | null;
  // Property used by EventDetailModal component
  image?: string;
}

// Hero and About - map to Supabase tables
export interface HeroStats {
  events: string;
  members: string;
  partners: string;
}

export type HeroContent = Database['public']['Tables']['hero_content']['Row'];
export type AboutContent = Database['public']['Tables']['about_content']['Row'];

// Custom interfaces for dashboard components with camelCase properties
export interface DashboardHeroContent {
  title: string;
  subtitle: string;
  description: string;
  stats: HeroStats;
  ctaText: string;
  ctaLink: string;
}

export interface DashboardAboutContent {
  title: string;
  subtitle: string;
  foundedYear: string;
  story: string[];
  features: Feature[];
}

export interface DashboardSiteSettings {
  siteName: string;
  siteDescription: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  socialMedia: Record<string, string>;
}

// GalleryItem from Supabase - Custom interface to fix property names
export interface GalleryImage {
  id: string;
  category: string;
  created_at: string | null;
  description: string | null;
  display_order: number | null;
  event_id: string | null;
  image_url: string;
  metadata: Json;
  partner_id?: string | null;
  status?: string;
  tags?: string[];
  thumbnail_url?: string | null;
  title: string;
  updated_at: string | null;
}

// EventArtist - app-specific, not direct Supabase table
export interface EventArtist {
  name: string;
  role?: string;
  image?: string;
  id?: string;
  event_id?: string;
  performance_time?: string | null;
}

// Public view types
export type PublicEventView = Database['public']['Views']['public_events_view']['Row'];
export type PublicEventsViewRow = Database['public']['Views']['public_events_view']['Row'];

// SiteSettings from Supabase
export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

// Admin types from Supabase
export type AdminSection = Database['public']['Tables']['admin_sections']['Row'];
export type SectionContent = Database['public']['Tables']['section_content']['Row'] & { section_slug: string };

export interface SectionPermissions {
  canView: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

// Context type updated to use Supabase types
export interface ContentContextType {
  events: PublicEventView[];
  partners: Partner[];
  gallery: GalleryImage[];
  team: TeamMember[];
  hero: HeroContent | null;
  about: AboutContent | null;
  settings: SiteSettings | null;
  loading: boolean;
  publicContent: Record<string, Json>;
  // Methods
  fetchEvents: () => Promise<void>;
  fetchPartners: () => Promise<void>;
  fetchGallery: () => Promise<void>;
  fetchTeam: () => Promise<void>;
  fetchHeroContent: () => Promise<void>;
  fetchAboutContent: () => Promise<void>;
  fetchSiteSettings: () => Promise<void>;
  fetchPublicContent: () => Promise<void>;
  saveHeroContent: (content: Database['public']['Tables']['hero_content']['Insert']) => Promise<void>;
  saveAboutContent: (content: Database['public']['Tables']['about_content']['Insert']) => Promise<void>;
  saveSiteSettings: (settings: Database['public']['Tables']['site_settings']['Insert']) => Promise<void>;
  addEvent: (event: Database['public']['Tables']['events']['Insert']) => Promise<void>;
  updateEvent: (id: string, event: Database['public']['Tables']['events']['Update']) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addGalleryImage: (image: Database['public']['Tables']['gallery_items']['Insert']) => Promise<void>;
  updateGalleryImage: (id: string, image: Database['public']['Tables']['gallery_items']['Update']) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;
  addTeamMember: (member: Database['public']['Tables']['team_members']['Insert']) => Promise<void>;
  updateTeamMember: (id: string, member: Database['public']['Tables']['team_members']['Update']) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  addPartner: (partner: Database['public']['Tables']['partners']['Insert']) => Promise<void>;
  updatePartner: (id: string, partner: Database['public']['Tables']['partners']['Update']) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  fetchEventArtists: (eventId: string) => Promise<EventArtist[]>;
  addEventArtist: (artist: EventArtist) => Promise<void>;
  updateEventArtist: (id: string, artist: EventArtist) => Promise<void>;
  deleteEventArtist: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Additional types for About section
export type Feature = {
  title: string;
  description: string;
};

export type StoryParagraph = string;

// AboutData interface that matches the Supabase Row type
export interface AboutData {
  created_at: string | null;
  features: Json;
  founded_year: string | null;
  id: string;
  story: string[] | null;
  subtitle: string | null;
  title: string;
  updated_at: string | null;
  updated_by: string | null;
}
