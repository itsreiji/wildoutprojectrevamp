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

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  uploadDate: string;
  event?: string;
}
