export interface HeroStats {
  events: string;
  members: string;
  partners: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  stats: HeroStats;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  featuredEventId?: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface AboutContent {
  title: string;
  subtitle: string;
  story: string[];
  foundedYear: string;
  features: Feature[];
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  uploadDate?: string;
  event?: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  image_urls?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}
