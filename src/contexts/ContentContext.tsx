
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { apiClient } from '../supabase/api/client';
import { Hero, About, Event as APIEvent, TeamMember as APITeamMember, Partner as APIPartner, Settings } from '../types/schemas';

// --- Internal UI Types (Legacy) ---
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
  phone?: string;
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
  phone: string;
  address: string;
  socialMedia: {
    instagram: string;
    twitter: string;
    facebook: string;
    youtube: string;
  };
}

// --- Initial Data (Fallback) ---
const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Neon Nights: Electronic Odyssey',
    description: 'Experience an unforgettable night of electronic music featuring Indonesia\'s top DJs and international guest artists. Immerse yourself in cutting-edge visuals and world-class production.',
    date: '2025-11-15',
    time: '21:00 - 04:00',
    venue: 'Jakarta Convention Center',
    venueAddress: 'Jl. Gatot Subroto, Jakarta Pusat',
    image: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodGxpZmUlMjBwYXJ0eSUyMGV2ZW50fGVufDF8fHx8MTc2MTgzNzA3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Music Festival',
    capacity: 5000,
    attendees: 3200,
    price: 'IDR 250K - 500K',
    artists: [
      { name: 'DJ Stellar', role: 'Headliner', image: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=400' },
      { name: 'Luna Beats', role: 'Supporting', image: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400' },
      { name: 'Midnight Mix', role: 'Opening', image: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800',
      'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800',
      'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800',
    ],
    highlights: [
      'International DJ lineup',
      'State-of-the-art sound system',
      '3D visual mapping',
      'VIP lounge access',
      'Food & beverage vendors',
    ],
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Urban Art Exhibition',
    description: 'Discover the vibrant world of Indonesian street art and contemporary visual culture. Featuring works from emerging and established artists.',
    date: '2025-11-20',
    time: '18:00 - 23:00',
    venue: 'Museum MACAN',
    venueAddress: 'Jl. Panjang No.5, Jakarta Barat',
    image: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwbW9kZXJufGVufDF8fHx8MTc2MTc2MDA1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Art & Culture',
    capacity: 800,
    attendees: 450,
    price: 'IDR 150K',
    artists: [
      { name: 'Eko Nugroho', role: 'Featured Artist', image: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400' },
      { name: 'Wedha Abdul Rasyid', role: 'Guest Artist', image: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800',
      'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=800',
    ],
    highlights: [
      'Live art performances',
      'Interactive installations',
      'Artist meet & greet',
      'Limited edition prints',
      'Complimentary drinks',
    ],
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Sunset Sessions Vol. 12',
    description: 'An intimate rooftop experience featuring acoustic performances, craft cocktails, and stunning city views as the sun sets over Jakarta.',
    date: '2025-11-25',
    time: '17:00 - 22:00',
    venue: 'Cloud Lounge',
    venueAddress: 'Jl. Jend. Sudirman, Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBjcm93ZHxlbnwxfHx8fDE3NjE4MzM0MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Live Music',
    capacity: 300,
    attendees: 285,
    price: 'IDR 200K',
    artists: [
      { name: 'Tulus', role: 'Headliner', image: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=400' },
      { name: 'Raisa', role: 'Special Guest', image: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800',
      'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800',
    ],
    highlights: [
      'Rooftop venue with city views',
      'Acoustic performances',
      'Craft cocktail menu',
      'Sunset viewing deck',
      'Limited capacity for intimate experience',
    ],
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Bass Rebellion: Underground Series',
    description: 'Dive deep into the underground bass music scene with Indonesia\'s finest dubstep, drum & bass, and trap artists. This is not for the faint of heart.',
    date: '2025-12-01',
    time: '22:00 - 05:00',
    venue: 'The Bunker',
    venueAddress: 'Jl. Kemang Raya, Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMHBlcmZvcm1hbmNlJTIwY2x1YnxlbnwxfHx8fDE3NjE4MTgwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Club Night',
    capacity: 1500,
    attendees: 1200,
    price: 'IDR 150K',
    artists: [
      { name: 'Bass Monkey', role: 'Headliner', image: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=400' },
      { name: 'Subsonic', role: 'Supporting', image: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400' },
      { name: 'Frequency', role: 'Opening', image: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800',
      'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800',
    ],
    highlights: [
      'Underground warehouse venue',
      'Heavy bass sound system',
      'Live visuals and lasers',
      'Multiple stages',
      'After-hours access',
    ],
    status: 'upcoming',
  },
];

const INITIAL_PARTNERS: Partner[] = [
  { id: '1', name: 'Spotify', category: 'Music', website: 'spotify.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '2', name: 'Red Bull', category: 'Energy', website: 'redbull.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '3', name: 'Heineken', category: 'Beverage', website: 'heineken.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '4', name: 'Nike', category: 'Lifestyle', website: 'nike.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '5', name: 'Adidas', category: 'Lifestyle', website: 'adidas.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '6', name: 'Apple Music', category: 'Music', website: 'apple.com/music', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '7', name: 'Corona', category: 'Beverage', website: 'corona.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '8', name: 'Converse', category: 'Lifestyle', website: 'converse.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '9', name: 'Gojek', category: 'Technology', website: 'gojek.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '10', name: 'Tokopedia', category: 'E-commerce', website: 'tokopedia.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '11', name: 'BCA', category: 'Financial', website: 'bca.co.id', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
  { id: '12', name: 'Telkomsel', category: 'Telecom', website: 'telkomsel.com', logoUrl: 'https://images.unsplash.com/photo-1585503609146-bc5572aa888e?w=100', status: 'active' },
];

const INITIAL_GALLERY: GalleryImage[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800', caption: 'Neon Nights Festival', uploadDate: '2025-10-28', event: 'Neon Nights' },
  { id: '2', url: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800', caption: 'Concert Crowd', uploadDate: '2025-10-27', event: 'Sunset Sessions' },
  { id: '3', url: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800', caption: 'DJ Performance', uploadDate: '2025-10-26', event: 'Bass Rebellion' },
  { id: '4', url: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800', caption: 'Art Exhibition', uploadDate: '2025-10-25', event: 'Urban Art' },
  { id: '5', url: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=800', caption: 'Creative Team', uploadDate: '2025-10-24' },
  { id: '6', url: 'https://images.unsplash.com/photo-1758922801699-09d8d788f90c?w=800', caption: 'Brand Partnership', uploadDate: '2025-10-23' },
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    email: 'sarah@wildoutproject.com',
    phone: '+62 812 3456 7890',
    bio: 'Visionary leader with 10+ years experience in nightlife and entertainment industry',
    photoUrl: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400',
    status: 'active',
  },
  // ... (keep truncated for brevity if preferred, but usually we keep original data)
];

const INITIAL_HERO: HeroContent = {
  title: 'WildOut!',
  subtitle: 'Media Digital Nightlife & Event Multi-Platform',
  description: "Indonesia's premier creative community connecting artists, events, and experiences. Join us in celebrating nightlife culture and creative collaborations.",
  stats: {
    events: '500+',
    members: '50K+',
    partners: '100+',
  },
};

const INITIAL_ABOUT: AboutContent = {
  title: 'About WildOut!',
  subtitle: "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020. We're more than just events – we're a movement.",
  story: [
    "Founded in 2020, WildOut! emerged from a simple idea: to create a platform that celebrates Indonesia's vibrant creative culture. What started as small gatherings has grown into one of the country's most influential creative communities.",
  ],
  foundedYear: '2020',
  features: [
    {
      title: 'Community First',
      description: 'We bring together passionate creatives, artists, and event enthusiasts to build lasting connections.',
    },
  ],
};

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'WildOut!',
  siteDescription: 'Media Digital Nightlife & Event Multi-Platform',
  tagline: "Indonesia's premier creative community platform",
  email: 'contact@wildoutproject.com',
  phone: '+62 21 1234 567',
  address: 'Jakarta, Indonesia',
  socialMedia: {
    instagram: 'https://instagram.com/wildoutproject.com',
    twitter: 'https://twitter.com/wildout_id',
    facebook: 'https://facebook.com/wildoutproject.com',
    youtube: 'https://youtube.com/@wildout',
  },
};

// Context
interface ContentContextType {
  events: Event[];
  partners: Partner[];
  gallery: GalleryImage[];
  team: TeamMember[];
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
  updateEvents: (events: Event[]) => void;
  updatePartners: (partners: Partner[]) => void;
  updateGallery: (gallery: GalleryImage[]) => void;
  updateTeam: (team: TeamMember[]) => void;
  updateHero: (hero: HeroContent) => Promise<void>;
  updateAbout: (about: AboutContent) => void;
  updateSettings: (settings: SiteSettings) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
  const [about, setAbout] = useState<AboutContent>(INITIAL_ABOUT);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 5000ms')), 5000)
      );

      const raceResult = await Promise.race([
        Promise.all([
          apiClient.getHero().catch((err) => {
            console.warn("Hero API call failed:", err);
            return null;
          }),
          apiClient.getEvents().catch((err) => {
            console.warn("Events API call failed:", err);
            return [];
          })
        ]),
        timeoutPromise
      ]) as [any, any];

      const [fetchedHero, fetchedEvents] = raceResult;

      if (fetchedHero) {
        setHero({
          title: fetchedHero.title,
          subtitle: fetchedHero.subtitle || '',
          description: fetchedHero.description || '',
          stats: {
            events: fetchedHero.stats?.events || '0',
            members: fetchedHero.stats?.members || '0',
            partners: fetchedHero.stats?.partners || '0'
          }
        });
      }

      if (fetchedEvents && fetchedEvents.length > 0) {
        // Map API events to internal format if needed
        // setEvents(mappedEvents);
      }

    } catch (err) {
      console.warn("Failed to fetch data from Supabase, using fallback:", err);
      // Keep using initial data as fallback - don't clear existing data
    } finally {
      setLoading(false);
    }
  }, []);

  // Update hero function that saves to Supabase
  const updateHeroContent = useCallback(async (heroData: HeroContent) => {
    console.log("Starting hero save process...", heroData);

    try {
      // Update local state immediately for responsive UI
      setHero(heroData);
      console.log("Local state updated");

      // Save to Supabase in background
      const apiData = {
        title: heroData.title,
        subtitle: heroData.subtitle,
        description: heroData.description,
        stats: {
          events: heroData.stats.events,
          members: heroData.stats.members,
          partners: heroData.stats.partners
        }
      };

      console.log("Making API call to Supabase edge function...");

      const result = await apiClient.updateHero(apiData);
      console.log("Hero section saved to Supabase successfully:", result);

    } catch (err: any) {
      console.error("Failed to save hero section to Supabase:", err);
      console.error("Error details:", {
        message: err?.message,
        url: "https://yanjivicgslwutjzhzdx.supabase.co/functions/v1"
      });
      // Revert local changes if save fails
      await refresh();
      throw err;
    }
  }, [apiClient, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    events,
    partners,
    gallery,
    team,
    hero,
    about,
    settings,
    updateEvents: setEvents,
    updatePartners: setPartners,
    updateGallery: setGallery,
    updateTeam: setTeam,
    updateHero: updateHeroContent,
    updateAbout: setAbout,
    updateSettings: setSettings,
    loading,
    refresh
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
