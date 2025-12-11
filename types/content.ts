// Content types for the WildOut! project

export interface TeamMember {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  linkedin_url?: string | null;
  status: 'active' | 'inactive';
  social_links?: Record<string, string | null>;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  category?: string;
  status: 'active' | 'inactive';
  contact_email?: string;
  contact_phone?: string;
  social_links?: Record<string, string | null>;
  created_at: string;
  updated_at: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stats: { events: string; members: string; partners: string };
  cta_text?: string;
  cta_link?: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface AboutContent {
  id: string;
  title: string;
  subtitle: string;
  founded_year: string;
  story: string[];
  features: { title: string; description: string }[];
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface GalleryImage {
  id: string;
  title?: string;
  description?: string;
  image_url?: string;
  category?: string;
  status?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  display_order: number | null;
  event_id: string | null;
  metadata: Record<string, any>;
  partner_id: string | null;
  thumbnail_url: string | null;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  social_media: Record<string, string>;
  created_at: string;
  updated_at: string;
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
  addEvent: (event: any) => Promise<any>;
  updateEvent: (id: string, updates: any) => Promise<any>;
  deleteEvent: (id: string) => Promise<void>;
  // Team member mutations
  addTeamMember: (member: any) => Promise<any>;
  updateTeamMember: (id: string, updates: any) => Promise<any>;
  deleteTeamMember: (id: string) => Promise<void>;
  // Partner mutations
  addPartner: (partner: any) => Promise<any>;
  updatePartner: (id: string, updates: any) => Promise<any>;
  deletePartner: (id: string) => Promise<void>;
  // Gallery mutations
  addGalleryImage: (image: any) => Promise<any>;
  updateGalleryImage: (id: string, updates: any) => Promise<any>;
  deleteGalleryImage: (id: string) => Promise<void>;
  // Event Artists mutations
  fetchEventArtists: (eventId: string) => Promise<EventArtist[]>;
  addEventArtist: (artist: Omit<EventArtist, 'id' | 'created_at' | 'updated_at'>) => Promise<EventArtist>;
  updateEventArtist: (id: string, updates: Partial<Omit<EventArtist, 'id' | 'created_at' | 'updated_at'>>) => Promise<EventArtist>;
  deleteEventArtist: (id: string) => Promise<void>;
  // Content mutations
  saveHeroContent: (content: HeroContent) => Promise<any>;
  saveAboutContent: (content: AboutContent) => Promise<any>;
  saveSiteSettings: (settings: SiteSettings) => Promise<any>;
  // Admin sections
  adminSections: AdminSection[];
  sectionContent: Record<string, SectionContent>;
  adminSectionsLoading: boolean;
  getSectionContent: (sectionId: string) => SectionContent | null;
  getSectionPermissions: (sectionId: string) => SectionPermissions[];
  updateSectionContent: (sectionId: string, content: SectionContent) => Promise<any>;
}

export interface AdminSection {
  id: string;
  slug: string;
  label: string;
  display_name: string;
  name: string;
  description?: string;
  display_order?: number;
  icon?: string;
  category?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  permissions: string[];
}

export interface SectionContent {
  payload: any;
  updated_at: string;
  updated_by: string;
  version: number;
}

export interface SectionPermissions {
  can_view: boolean;
  can_edit: boolean;
  can_publish: boolean;
  can_delete: boolean;
}

export interface LandingEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  time: string;
  location: string;
  category: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  capacity: number | null;
  attendees: number | null;
  currency: string;
  price: number | null;
  price_range: string | null;
  artists: any[];
  gallery: any[];
  highlights: any[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  tags: string[];
  image_url: string;
  partner_name: string;
  partner_logo_url: string;
}

export interface EventArtist {
  id: string;
  event_id: string;
  name: string;
  role?: string;
  image?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PublicEventsViewRow {
  artists: Record<string, any> | null;
  attendees: number | null;
  capacity: number | null;
  category: string | null;
  created_at: string | null;
  currency: string | null;
  description: string | null;
  end_date: string | null;
  gallery: Record<string, any> | null;
  highlights: Record<string, any> | null;
  id: string | null;
  image: string | null;
  image_url: string | null;
  location: string | null;
  metadata: Record<string, any> | null;
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
