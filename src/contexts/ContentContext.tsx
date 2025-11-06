/* @refresh reset */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Event, TeamMember, Partner, GalleryImage, HeroContent, AboutContent, SiteSettings } from '../types';

// Export types for other components that need them
export type { Event, TeamMember, Partner, GalleryImage, HeroContent, AboutContent, SiteSettings };

// Initial Data
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
      'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800',
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
    description: 'Discover vibrant world of Indonesian street art and contemporary visual culture. Featuring works from emerging and established artists.',
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
    image: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBjcm93ZHxlbnwxfHx8fDE3NjE4MzMwMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    description: 'Dive deep into underground bass music scene with Indonesia\'s finest dubstep, drum & bass, and trap artists. This is not for the faint of heart.',
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
  { id: '1', name: 'Spotify', category: 'Music', website: 'spotify.com', status: 'active' },
  { id: '2', name: 'Red Bull', category: 'Energy', website: 'redbull.com', status: 'active' },
  { id: '3', name: 'Heineken', category: 'Beverage', website: 'heineken.com', status: 'active' },
  { id: '4', name: 'Nike', category: 'Lifestyle', website: 'nike.com', status: 'active' },
  { id: '5', name: 'Adidas', category: 'Lifestyle', website: 'adidas.com', status: 'active' },
  { id: '6', name: 'Apple Music', category: 'Music', website: 'apple.com/music', status: 'active' },
  { id: '7', name: 'Corona', category: 'Beverage', website: 'corona.com', status: 'active' },
  { id: '8', name: 'Converse', category: 'Lifestyle', website: 'converse.com', status: 'active' },
  { id: '9', name: 'Gojek', category: 'Technology', website: 'gojek.com', status: 'active' },
  { id: '10', name: 'Tokopedia', category: 'E-commerce', website: 'tokopedia.com', status: 'active' },
  { id: '11', name: 'BCA', category: 'Financial', website: 'bca.co.id', status: 'active' },
  { id: '12', name: 'Telkomsel', category: 'Telecom', website: 'telkomsel.com', status: 'active' },
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
    email: 'sarah@wildout.id',
    phone: '+62 812 3456 7890',
    bio: 'Visionary leader with 10+ years experience in nightlife and entertainment industry',
    photoUrl: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400',
    status: 'active',
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Creative Director',
    email: 'michael@wildout.id',
    phone: '+62 813 7654 3210',
    bio: 'Award-winning creative with passion for innovative event experiences',
    photoUrl: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400',
    status: 'active',
  },
  {
    id: '3',
    name: 'Aisha Patel',
    role: 'Marketing Director',
    email: 'aisha@wildout.id',
    phone: '+62 814 8765 4321',
    bio: 'Digital marketing strategist specializing in community engagement',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    status: 'active',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Operations Manager',
    email: 'david@wildout.id',
    phone: '+62 815 2468 1357',
    bio: 'Expert in logistics and operational excellence for large-scale events',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    status: 'active',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    role: 'Event Coordinator',
    email: 'priya@wildout.id',
    phone: '+62 816 9753 8642',
    bio: 'Meticulous planner ensuring flawless event execution',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    status: 'active',
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Technical Director',
    email: 'james@wildout.id',
    phone: '+62 817 3698 5274',
    bio: 'Audio-visual expert with cutting-edge production knowledge',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    status: 'active',
  },
  {
    id: '7',
    name: 'Natasha Williams',
    role: 'Social Media Manager',
    email: 'natasha@wildout.id',
    phone: '+62 818 7531 9864',
    bio: 'Content creator building vibrant online communities',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    status: 'active',
  },
  {
    id: '8',
    name: 'Alex Zhang',
    role: 'Sponsorship Manager',
    email: 'alex@wildout.id',
    phone: '+62 819 8524 7136',
    bio: 'Building strategic partnerships with leading brands',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    status: 'active',
  },
  {
    id: '9',
    name: 'Maria Santos',
    role: 'Artist Relations',
    email: 'maria@wildout.id',
    phone: '+62 820 1472 5836',
    bio: 'Connecting top talent with incredible event opportunities',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    status: 'active',
  },
  {
    id: '10',
    name: 'Ryan Thompson',
    role: 'Design Lead',
    email: 'ryan@wildout.id',
    phone: '+62 821 9517 3648',
    bio: 'Creating stunning visual identities for memorable events',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    status: 'active',
  },
  {
    id: '11',
    name: 'Lily Anderson',
    role: 'Customer Experience',
    email: 'lily@wildout.id',
    phone: '+62 822 7539 5148',
    bio: 'Ensuring every guest has an unforgettable experience',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    status: 'active',
  },
  {
    id: '12',
    name: 'Omar Hassan',
    role: 'Finance Manager',
    email: 'omar@wildout.id',
    phone: '+62 823 8642 9753',
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
    "Our mission is to empower artists, connect communities, and push boundaries of what's possible in nightlife and event culture. Join us in shaping the future of Indonesia's creative scene.",
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
  email: 'contact@wildout.id',
  phone: '+62 21 1234 567',
  address: 'Jakarta, Indonesia',
  socialMedia: {
    instagram: 'https://instagram.com/wildout.id',
    twitter: 'https://twitter.com/wildout_id',
    facebook: 'https://facebook.com/wildout.id',
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
  updateHero: (hero: HeroContent) => void;
  updateAbout: (about: AboutContent) => void;
  updateSettings: (settings: SiteSettings) => void;
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
    updateHero: setHero,
    updateAbout: setAbout,
    updateSettings: setSettings,
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
