export interface Partner {
  id: string;
  name: string;
  category?: string | null;
  website?: string | null;
  website_url?: string | null;
  status?: 'active' | 'inactive';
  description?: string | null;
  logo_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  featured?: boolean;
  social_links?: Record<string, string | null> | null;
  created_at?: string;
  updated_at?: string;
}
