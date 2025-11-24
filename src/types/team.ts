import type { Database } from '../supabase/types';

export type TeamMember = Database['public']['Tables']['team_members']['Row'];
