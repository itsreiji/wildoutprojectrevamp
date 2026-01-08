import type { 
  Event, 
  Partner, 
  GalleryImage, 
  TeamMember, 
  HeroContent, 
  AboutContent, 
  SiteSettings 
} from '../types/content';

export const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Neon Nights: Electronic Odyssey',
    description: 'Experience an unforgettable night of electronic music featuring Indonesia\'s top DJs and international guest artists. Immerse yourself in cutting-edge visuals and world-class production.',
    date: '2025-11-15',
    time: '21:00 - 04:00',
    venue: 'Dragonfly Jakarta',
    venueAddress: 'Gatot Subroto No.Kav 23, Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbHViJTIwcGFydHl8ZW58MXx8fHwxNzYxODE3OTY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Festival',
    capacity: 2000,
    attendees: 1850,
    price: 'IDR 350K',
    artists: [
      { name: 'Winky Wiryawan', role: 'Headliner', image: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=400' },
      { name: 'Dipha Barus', role: 'Co-Headliner', image: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=400' },
      { name: 'KimoKal', role: 'Supporting', image: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800',
      'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800',
      'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800',
    ],
    highlights: [
      'Largest indoor LED production in SE Asia',
      'Exclusive VIP lounge experience',
      'International standard sound system',
      'Live broadcast on WildOut! platform',
      'Curated cocktail menu by award-winning mixologists',
    ],
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Urban Art Expo: Jakarta Edition',
    description: 'A celebration of street culture, featuring live graffiti walls, local designer showcases, and underground hip-hop performances. Witness the transformation of an industrial space into a vibrant art gallery.',
    date: '2025-11-20',
    time: '14:00 - 22:00',
    venue: 'M Bloc Space',
    venueAddress: 'Jl. Panglima Polim No.37, Jakarta Selatan',
    image: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFmZml0aSUyMGFydHxlbnwxfHx8fDE3NjE4MTgwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Exhibition',
    capacity: 1000,
    attendees: 450,
    price: 'Free Entry',
    artists: [
      { name: 'Tutu', role: 'Lead Artist', image: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=400' },
      { name: 'Muck', role: 'Guest Artist', image: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=400' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800',
      'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=800',
    ],
    highlights: [
      'Live 24h mural painting',
      'Limited edition merchandise drop',
      'Sneaker customization workshop',
      'Community talk sessions',
      'Street food bazaar',
    ],
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Sunset Sessions: Acoustic Rooftop',
    description: 'Unwind with soulful acoustic performances as the sun sets over Jakarta\'s skyline. An intimate evening featuring emerging singer-songwriters in a cozy, upscale environment.',
    date: '2025-11-28',
    time: '17:00 - 21:00',
    venue: 'Henshin Jakarta',
    venueAddress: 'Level 67-69, The Westin Jakarta',
    image: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29mdG9wJTIwcGFydHl8ZW58MXx8fHwxNzYxODE4MDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Concert',
    capacity: 300,
    attendees: 280,
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

export const INITIAL_PARTNERS: Partner[] = [
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

export const INITIAL_GALLERY: GalleryImage[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1709131482554-53117b122a35?w=800', caption: 'Neon Nights Festival', uploadDate: '2025-10-28', event: 'Neon Nights' },
  { id: '2', url: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?w=800', caption: 'Concert Crowd', uploadDate: '2025-10-27', event: 'Sunset Sessions' },
  { id: '3', url: 'https://images.unsplash.com/photo-1761637955469-ee3c0dfdfb34?w=800', caption: 'DJ Performance', uploadDate: '2025-10-26', event: 'Bass Rebellion' },
  { id: '4', url: 'https://images.unsplash.com/photo-1599949287142-9a208b301ecd?w=800', caption: 'Art Exhibition', uploadDate: '2025-10-25', event: 'Urban Art' },
  { id: '5', url: 'https://images.unsplash.com/photo-1676277757211-ebd7fdeb3d5b?w=800', caption: 'Creative Team', uploadDate: '2025-10-24' },
  { id: '6', url: 'https://images.unsplash.com/photo-1758922801699-09d8d788f90c?w=800', caption: 'Brand Partnership', uploadDate: '2025-10-23' },
];

export const INITIAL_TEAM: TeamMember[] = [];

export const INITIAL_HERO: HeroContent = {
  title: 'WildOut!',
  subtitle: 'Media Digital Nightlife & Event Multi-Platform',
  description: "Indonesia's premier creative community connecting artists, events, and experiences. Join us in celebrating nightlife culture and creative collaborations.",
  stats: {
    events: '500+',
    members: '50K+',
    partners: '100+',
  },
};

export const INITIAL_ABOUT: AboutContent = {
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

export const INITIAL_SETTINGS: SiteSettings = {
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
