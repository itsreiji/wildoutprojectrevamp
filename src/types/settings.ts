import type { Database } from '../supabase/types';

export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
