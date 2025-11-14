export interface TeamMember {
  id: string;
  name: string;
  title?: string | null;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  avatar_url?: string | null;
  social_links?: Record<string, string | null> | null;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}
