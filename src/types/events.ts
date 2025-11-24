import type { Database } from '../supabase/types';

export type SupabaseEvent = Database['public']['Tables']['events']['Row'];
export type NewSupabaseEvent = Database['public']['Tables']['events']['Insert'];
export type UpdateSupabaseEvent = Database['public']['Tables']['events']['Update'];

export interface EventArtist {
  name: string;
  role?: string;
  image?: string;
}

export interface AdminEventArtist {
  id: string;
  artist_name: string;
  role: string;
  performance_time: string | null;
  created_at: string;
}

// Extend Supabase types for app-specific fields
export interface Event extends Omit<SupabaseEvent, 'gallery_images_urls'> {
  artists?: EventArtist[];
  gallery?: string[]; // Derived from gallery_items relation
}
