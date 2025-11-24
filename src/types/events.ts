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

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  venue: string;
  venueAddress: string;
  image: string;
  category?: string | null;
  capacity?: number | null;
  attendees?: number | null;
  price?: string | null;
  price_range?: string | null;
  ticket_url?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  artists: EventArtist[];
  gallery?: string[];
  highlights?: string[];
  start_date: string;
  end_date: string;
  location?: string | null;
  partner_name?: string | null;
  partner_logo_url?: string | null;
  partner_website_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}
