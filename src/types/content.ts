import type { Database, Json } from '../supabase/types';

export type { TablesInsert, TablesUpdate } from '../supabase/types';

// Hero and About - map to Supabase tables
export interface HeroStats {
  events: string;
  members: string;
  partners: string;
}

export type HeroContent = Database['public']['Tables']['hero_content']['Row'];
export type AboutContent = Database['public']['Tables']['about_content']['Row'];

// GalleryItem from Supabase
export type GalleryImage = Database['public']['Tables']['gallery_items']['Row'];

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
  partners: Database['public']['Tables']['partners']['Row'][];
  gallery: GalleryImage[];
  team: Database['public']['Tables']['team_members']['Row'][];
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
  publicContent: Record<string, Json>;
  // ... rest remains similar but with correct types
}
