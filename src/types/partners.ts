import type { Database } from '../supabase/types';

export type Partner = Database['public']['Tables']['partners']['Row'];
