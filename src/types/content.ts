export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  venueAddress: string;
  image: string;
  category: string;
  capacity: number;
  attendees: number;
  price: string;
  artists: Array<{
    name: string;
    role: string;
    image: string;
  }>;
  gallery: string[];
  highlights: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  website: string;
  logoUrl?: string;
  status: 'active' | 'inactive';
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  uploadDate: string;
  event?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  instagram?: string;
  bio: string;
  photoUrl?: string;
  status: 'active' | 'inactive';
}

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  stats: {
    events: string;
    members: string;
    partners: string;
  };
}

export interface AboutContent {
  title: string;
  subtitle: string;
  story: string[];
  foundedYear: string;
  features: Array<{
    title: string;
    description: string;
  }>;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  tagline: string;
  email: string;
  address: string;
  socialMedia: {
    instagram: string;
    twitter: string;
    facebook: string;
    youtube: string;
  };
}

export interface ContentContextType {
  events: Event[];
  partners: Partner[];
  gallery: GalleryImage[];
  team: TeamMember[];
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
  updateEvents: (events: Event[]) => Promise<void>;
  updatePartners: (partners: Partner[]) => Promise<void>;
  updateGallery: (gallery: GalleryImage[]) => Promise<void>;
  updateTeam: (team: TeamMember[]) => Promise<void>;
  updateHero: (hero: HeroContent) => Promise<void>;
  updateAbout: (about: AboutContent) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  loading: boolean;
  refresh: () => Promise<void>;
}
