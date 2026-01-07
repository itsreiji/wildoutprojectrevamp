
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
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
    name: 'Sarah Jenkins',
    role: 'CEO & Founder',
    email: 'sarah@wildoutproject.com',
    instagram: '@sarahjenkins',
    bio: 'Visionary leader with 10+ years experience in nightlife and entertainment industry',
    photoUrl: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400',
    status: 'active',
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Creative Director',
    email: 'michael@wildoutproject.com',
    instagram: '@mikerod',
    bio: 'Award-winning creative with passion for innovative event experiences',
    photoUrl: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400',
    status: 'active',
  },
  {
    id: '3',
    name: 'Aisha Patel',
    role: 'Marketing Director',
    email: 'aisha@wildoutproject.com',
    instagram: '@aishapatel',
    bio: 'Digital marketing strategist specializing in community engagement',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    status: 'active',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Operations Manager',
    email: 'david@wildoutproject.com',
    instagram: '@davidkim',
    bio: 'Expert in logistics and operational excellence for large-scale events',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    status: 'active',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    role: 'Event Coordinator',
    email: 'priya@wildoutproject.com',
    instagram: '@priyasharma',
    bio: 'Meticulous planner ensuring flawless event execution',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    status: 'active',
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Technical Director',
    email: 'james@wildoutproject.com',
    instagram: '@jameswilson',
    bio: 'Audio-visual expert with cutting-edge production knowledge',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    status: 'active',
  },
  {
    id: '7',
    name: 'Natasha Williams',
    role: 'Social Media Manager',
    email: 'natasha@wildoutproject.com',
    instagram: '@natashaw',
    bio: 'Content creator building vibrant online communities',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    status: 'active',
  },
  {
    id: '8',
    name: 'Alex Zhang',
    role: 'Sponsorship Manager',
    email: 'alex@wildoutproject.com',
    instagram: '@alexzhang',
    bio: 'Building strategic partnerships with leading brands',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    status: 'active',
  },
  {
    id: '9',
    name: 'Maria Santos',
    role: 'Artist Relations',
    email: 'maria@wildoutproject.com',
    instagram: '@mariasantos',
    bio: 'Connecting top talent with incredible event opportunities',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    status: 'active',
  },
  {
    id: '10',
    name: 'Ryan Thompson',
    role: 'Design Lead',
    email: 'ryan@wildoutproject.com',
    instagram: '@ryanthompson',
    bio: 'Creating stunning visual identities for memorable events',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    status: 'active',
  },
  {
    id: '11',
    name: 'Lily Anderson',
    role: 'Customer Experience',
    email: 'lily@wildoutproject.com',
    instagram: '@lilyanderson',
    bio: 'Ensuring every guest has an unforgettable experience',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    status: 'active',
  },
  {
    id: '12',
    name: 'Omar Hassan',
    role: 'Finance Manager',
    email: 'omar@wildoutproject.com',
    instagram: '@omarhassan',
    bio: 'Managing financial strategy and sustainable growth',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    status: 'active',
  },
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
    "We've hosted over 500 events, connected more than 50,000 creative professionals, and partnered with 100+ brands to bring unforgettable experiences to our community. From intimate art exhibitions to massive music festivals, we're dedicated to showcasing the best of Indonesia's creative talent.",
    "Our mission is to empower artists, connect communities, and push the boundaries of what's possible in nightlife and event culture. Join us in shaping the future of Indonesia's creative scene.",
  ],
  foundedYear: '2020',
  features: [
    {
      title: 'Community First',
      description: 'We bring together passionate creatives, artists, and event enthusiasts to build lasting connections.',
    },
    {
      title: 'Unforgettable Experiences',
      description: 'Every event is crafted to deliver unique, memorable moments that resonate with our community.',
    },
    {
      title: 'Collaborative Spirit',
      description: 'We partner with local and international brands to create opportunities for growth and collaboration.',
    },
    {
      title: 'Creative Innovation',
      description: 'Pushing boundaries with cutting-edge production, technology, and artistic expression.',
    },
  ],
};

const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'WildOut!',
  siteDescription: 'Media Digital Nightlife & Event Multi-Platform',
  tagline: "Indonesia's premier creative community platform",
  email: 'contact@wildoutproject.com',
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

  // Refs to store current state for use in callbacks without stale closures
  const teamRef = useRef<TeamMember[]>(INITIAL_TEAM);
  const eventsRef = useRef<Event[]>(INITIAL_EVENTS);
  const partnersRef = useRef<Partner[]>(INITIAL_PARTNERS);
  const galleryRef = useRef<GalleryImage[]>(INITIAL_GALLERY);
  const heroRef = useRef<HeroContent>(INITIAL_HERO);
  const aboutRef = useRef<AboutContent>(INITIAL_ABOUT);
  const settingsRef = useRef<SiteSettings>(INITIAL_SETTINGS);

  // Keep refs in sync with state
  useEffect(() => {
    teamRef.current = team;
  }, [team]);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    partnersRef.current = partners;
  }, [partners]);

  useEffect(() => {
    galleryRef.current = gallery;
  }, [gallery]);

  useEffect(() => {
    heroRef.current = hero;
  }, [hero]);

  useEffect(() => {
    aboutRef.current = about;
  }, [about]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const refresh = useCallback(async () => {
    console.log("🔄 REFRESH STARTED - Fetching all data from server...");
    setLoading(true);
    try {
      // Individual timeouts for each API call to prevent complete hang
      const fetchWithTimeout = async <T>(promise: Promise<T>, name: string, timeoutMs: number = 5000): Promise<T | null> => {
        let completed = false;
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => {
            if (!completed) {
              console.warn(`⏱️ ${name} timeout after ${timeoutMs}ms`);
              resolve(null);
            }
          }, timeoutMs)
        );
        try {
          const result = await Promise.race([promise.finally(() => { completed = true; }), timeoutPromise]);
          return result;
        } catch (err) {
          console.warn(`⚠️ ${name} failed:`, err);
          return null;
        }
      };

      console.log("🚀 Starting parallel API calls with individual timeouts...");

      // Fetch all data with individual timeouts - increased to 15s for slow Supabase
      const [fetchedHero, fetchedEvents, fetchedAbout, fetchedTeam, fetchedPartners, fetchedSettings] = await Promise.all([
        fetchWithTimeout(apiClient.getHero(), "Hero", 15000),
        fetchWithTimeout(apiClient.getEvents(), "Events", 15000),
        fetchWithTimeout(apiClient.getAbout(), "About", 15000),
        fetchWithTimeout(apiClient.getTeam(), "Team", 15000),
        fetchWithTimeout(apiClient.getPartners(), "Partners", 15000),
        fetchWithTimeout(apiClient.getSettings(), "Settings", 15000).catch(() => null)
      ]);

      console.log("✅ API calls completed - processing results...");

      if (fetchedHero) {
        console.log("✅ Hero data received");
        setHero(fetchedHero);
      }

      if (fetchedAbout) {
        console.log("✅ About data received");
        setAbout(fetchedAbout);
      }

      if (fetchedTeam && fetchedTeam.length > 0) {
        console.log(`✅ Team data received: ${fetchedTeam.length} members`);
        setTeam(fetchedTeam);
      }

      if (fetchedEvents && fetchedEvents.length > 0) {
        console.log(`✅ Events data received: ${fetchedEvents.length} events`);
        setEvents(fetchedEvents);
      }

      if (fetchedPartners && fetchedPartners.length > 0) {
        console.log(`✅ Partners data received: ${fetchedPartners.length} partners`);
        setPartners(fetchedPartners);
      }

      if (fetchedSettings !== null && fetchedSettings !== undefined) {
        console.log("✅ Settings data received");
        setSettings(fetchedSettings);
      } else {
        console.log("⚠️ Settings not found, keeping default");
      }

      console.log("✅ REFRESH COMPLETED - Data updated from server");

    } catch (err) {
      console.error("❌ REFRESH FAILED:", err);
      console.warn("⚠️ Using existing local data as fallback");
    } finally {
      setLoading(false);
      console.log("🔄 REFRESH FINISHED");
    }
  }, []);

  // Update hero function that saves to Supabase
  const updateHeroContent = useCallback(async (heroData: HeroContent) => {
    const oldHero = {...heroRef.current}; // Store old state for rollback using ref
    console.log("Starting hero save process...", heroData);

    try {
      // Update local state immediately for responsive UI
      setHero(heroData);
      console.log("Local hero state updated");

      console.log("Making API call to Supabase edge function...");
      const result = await apiClient.updateHero(heroData);
      console.log("✅ Hero section saved to Supabase successfully:", result);

    } catch (err: any) {
      console.error("❌ Failed to save hero section to Supabase, reverting:", err);
      // Revert local changes if save fails
      setHero(oldHero);
      throw err;
    }
  }, [apiClient]);

  // Update about function that saves to Supabase
  const updateAboutContent = useCallback(async (aboutData: AboutContent) => {
    const oldAbout = {...aboutRef.current}; // Store old state for rollback using ref
    try {
      setAbout(aboutData);
      await apiClient.updateAbout(aboutData);
      console.log("✅ About section saved to Supabase successfully");
    } catch (err) {
      console.error("❌ Failed to save about section to Supabase, reverting:", err);
      setAbout(oldAbout);
      throw err;
    }
  }, [apiClient]);

  // Update team function that saves to Supabase
  const updateTeamContent = useCallback(async (teamData: TeamMember[]) => {
    // Store old state for potential rollback using ref to avoid stale closures
    const oldTeam = [...teamRef.current];

    console.log("=== 🔄 TEAM UPDATE FLOW START ===");
    console.log("Old team:", oldTeam);
    console.log("New team:", teamData);

    try {
      // Update local state immediately for responsive UI
      setTeam(teamData);
      console.log("✅ Local state updated");

      // Process changes
      const errors: string[] = [];

      // Find added/updated members
      for (const member of teamData) {
        const oldMember = oldTeam.find(m => m.id === member.id);
        try {
          if (!oldMember) {
            console.log(`🚀 CREATE: ${member.name}`);
            await apiClient.createTeamMember(member);
          } else if (JSON.stringify(oldMember) !== JSON.stringify(member)) {
            console.log(`🔄 UPDATE: ${member.name}`);
            await apiClient.updateTeamMember(member.id, member);
          }
        } catch (err: any) {
          console.error(`❌ FAILED ${member.name}:`, err);
          errors.push(`Member ${member.name}: ${err.message}`);
        }
      }

      // Find deleted members
      for (const oldMember of oldTeam) {
        if (!teamData.find(m => m.id === oldMember.id)) {
          try {
            console.log(`🗑️  DELETE: ${oldMember.name}`);
            await apiClient.deleteTeamMember(oldMember.id);
          } catch (err: any) {
            console.error(`❌ FAILED DELETE ${oldMember.name}:`, err);
            errors.push(`Delete ${oldMember.name}: ${err.message}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      console.log("✅ ALL API CALLS SUCCESSFUL");
      console.log("=== 🔄 TEAM UPDATE FLOW COMPLETE ===");

      return true;
    } catch (err) {
      console.error("❌ FAILURE - Reverting:", err);
      // Revert to old state
      setTeam(oldTeam);
      throw err;
    }
  }, [apiClient]);

  // Update partners function that saves to Supabase
  const updatePartnersContent = useCallback(async (partnersData: Partner[]) => {
    const oldPartners = [...partnersRef.current]; // Store old state for rollback using ref

    try {
      setPartners(partnersData);
      console.log("Local partners state updated:", partnersData);

      const errors: string[] = [];

      // Find added/updated partners
      for (const partner of partnersData) {
        const oldPartner = oldPartners.find(p => p.id === partner.id);
        try {
          if (!oldPartner) {
            console.log("Creating new partner:", partner.id);
            await apiClient.createPartner(partner);
          } else if (JSON.stringify(oldPartner) !== JSON.stringify(partner)) {
            console.log("Updating partner:", partner.id);
            await apiClient.updatePartner(partner.id, partner);
          }
        } catch (err: any) {
          console.error(`Failed to process partner ${partner.id}:`, err);
          errors.push(`Partner ${partner.name}: ${err.message}`);
        }
      }

      // Find deleted partners
      for (const oldPartner of oldPartners) {
        if (!partnersData.find(p => p.id === oldPartner.id)) {
          try {
            console.log("Deleting partner:", oldPartner.id);
            await apiClient.deletePartner(oldPartner.id);
          } catch (err: any) {
            console.error(`Failed to delete partner ${oldPartner.id}:`, err);
            errors.push(`Delete ${oldPartner.name}: ${err.message}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      console.log("✅ Partners successfully synchronized with Supabase");
      return true;
    } catch (err) {
      console.error("❌ Failed to update partners in Supabase, reverting:", err);
      setPartners(oldPartners);
      throw err;
    }
  }, [apiClient]);

  // Update settings function that saves to Supabase
  const updateSettingsContent = useCallback(async (settingsData: SiteSettings) => {
    const oldSettings = {...settingsRef.current}; // Store old state for rollback using ref
    try {
      setSettings(settingsData);
      await apiClient.updateSettings(settingsData);
      console.log("✅ Settings saved to Supabase successfully");
    } catch (err) {
      console.error("❌ Failed to save settings to Supabase, reverting:", err);
      setSettings(oldSettings);
      throw err;
    }
  }, [apiClient]);

  const updateEventsContent = useCallback(async (eventsData: Event[]) => {
    const oldEvents = [...eventsRef.current]; // Store old state for rollback using ref
    try {
      setEvents(eventsData);
      console.log("Local events state updated:", eventsData);

      const errors: string[] = [];

      // Update or create events
      for (const event of eventsData) {
        const oldEvent = oldEvents.find(e => e.id === event.id);
        try {
          if (!oldEvent) {
            console.log("Creating new event:", event.id);
            await apiClient.createEvent(event);
          } else if (JSON.stringify(oldEvent) !== JSON.stringify(event)) {
            console.log("Updating event:", event.id);
            await apiClient.updateEvent(event.id, event);
          }
        } catch (err: any) {
          console.error(`Failed to process event ${event.id}:`, err);
          errors.push(`Event ${event.title}: ${err.message}`);
        }
      }

      // Delete removed events
      for (const oldEvent of oldEvents) {
        if (!eventsData.find(e => e.id === oldEvent.id)) {
          try {
            console.log("Deleting event:", oldEvent.id);
            await apiClient.deleteEvent(oldEvent.id);
          } catch (err: any) {
            console.error(`Failed to delete event ${oldEvent.id}:`, err);
            errors.push(`Delete ${oldEvent.title}: ${err.message}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      console.log("✅ Events successfully synchronized with Supabase");
      return true;
    } catch (err) {
      console.error("❌ Failed to update events in Supabase, reverting:", err);
      setEvents(oldEvents);
      throw err;
    }
  }, [apiClient]);

  const updateGalleryContent = useCallback(async (galleryData: GalleryImage[]) => {
    const oldGallery = [...galleryRef.current]; // Store old state for rollback using ref
    try {
      setGallery(galleryData);
      console.log("Local gallery state updated:", galleryData);

      const errors: string[] = [];

      // Update or create images
      for (const image of galleryData) {
        const oldImage = oldGallery.find(img => img.id === image.id);
        try {
          if (!oldImage) {
            console.log("Creating new gallery image:", image.id);
            await apiClient.createGalleryImage(image);
          }
        } catch (err: any) {
          console.error(`Failed to process gallery image ${image.id}:`, err);
          errors.push(`Gallery image ${image.caption}: ${err.message}`);
        }
      }

      // Delete removed images
      for (const oldImage of oldGallery) {
        if (!galleryData.find(img => img.id === oldImage.id)) {
          try {
            console.log("Deleting gallery image:", oldImage.id);
            await apiClient.deleteGalleryImage(oldImage.id);
          } catch (err: any) {
            console.error(`Failed to delete gallery image ${oldImage.id}:`, err);
            errors.push(`Delete ${oldImage.caption}: ${err.message}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      console.log("✅ Gallery successfully synchronized with Supabase");
      return true;
    } catch (err) {
      console.error("❌ Failed to update gallery in Supabase, reverting:", err);
      setGallery(oldGallery);
      throw err;
    }
  }, [apiClient]);

  // Load data from Supabase on mount
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
    updateEvents: updateEventsContent,
    updatePartners: updatePartnersContent,
    updateGallery: updateGalleryContent,
    updateTeam: updateTeamContent,
    updateHero: updateHeroContent,
    updateAbout: updateAboutContent,
    updateSettings: updateSettingsContent,
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
