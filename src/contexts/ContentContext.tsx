/* @refresh reset */
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import supabaseClient from "../supabase/client";
import type {
    Database,
    Json,
} from "../supabase/types";
import { useAuth } from "./AuthContext";

import type {
    AboutContent,
    ContentContextType,
    EventArtist,
    GalleryImage,
    HeroContent,
    Partner,
    PublicEventView,
    SiteSettings,
    TeamMember
} from "@/types/content";
const normalizeSocialLinks = (
  value: Json | undefined
): Record<string, string | null> => {
  if (!value || typeof value === "string") return {};
  if (Array.isArray(value)) return {};
  return Object.entries(value as Record<string, Json | undefined>).reduce<
    Record<string, string | null>
  >((acc, [key, entry]) => {
    if (typeof entry === "string") {
      acc[key] = entry;
    } else if (typeof entry === "number" || typeof entry === "boolean") {
      acc[key] = String(entry);
    } else if (entry === null || entry === undefined) {
      acc[key] = null;
    }
    return acc;
  }, {});
};

const ensureStringArray = (value: Json | undefined): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return undefined;
};

// Initial data aligned with new types
const INITIAL_EVENTS: PublicEventView[] = [];
const INITIAL_PARTNERS: Partner[] = [];
const INITIAL_GALLERY: GalleryImage[] = [];
const INITIAL_TEAM: TeamMember[] = [];
const INITIAL_HERO: HeroContent = {
  id: "00000000-0000-0000-0000-000000000001",
  title: "WildOut!",
  subtitle: "Media Digital Nightlife & Event Multi-Platform",
  description:
    "Indonesia's premier creative community connecting artists, events, and experiences.",
  stats: { events: "500+", members: "50K+", partners: "100+" },
  cta_text: "Join Us",
  cta_link: "/events",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: null,
};
const INITIAL_ABOUT: AboutContent = {
  id: "00000000-0000-0000-0000-000000000002",
  title: "About WildOut!",
  subtitle:
    "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020.",
  founded_year: "2020",
  story: [
    "Founded in 2020, WildOut! celebrates Indonesia’s creative culture.",
    "We host community-driven events that bring artists, venues, and sponsors together.",
  ],
  features: [
    { title: "Community First", description: "We build lasting connections." },
    {
      title: "Unforgettable Experiences",
      description: "Every event is crafted to be memorable.",
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: null,
};
const INITIAL_SETTINGS: SiteSettings = {
  id: "00000000-0000-0000-0000-000000000003",
  site_name: "WildOut!",
  site_description: "Indonesia's premier creative community platform",
  tagline: "Indonesia's premier creative community platform",
  email: "contact@wildoutproject.com",
  phone: "+62 21 1234 567",
  address: "Jakarta, Indonesia",
  social_media: {
    instagram: "https://instagram.com/wildoutproject.com",
    twitter: "https://twitter.com/wildout_id",
    facebook: "https://facebook.com/wildoutproject.com",
    youtube: "https://youtube.com/@wildout",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: null,
};

// Fetch functions using content.ts types
const fetchHeroContent = async (): Promise<HeroContent> => {
  try {
    const { data, error } = await supabaseClient.rpc("get_hero_content");
    if (error) {
      console.error("Error fetching hero content:", error);
      return INITIAL_HERO;
    }
    const result = (data as any)?.[0] as
      | Database["public"]["Tables"]["hero_content"]["Row"]
      | undefined;
    if (result) {
      return {
        id: result.id ?? INITIAL_HERO.id,
        title: result.title ?? INITIAL_HERO.title,
        subtitle: result.subtitle ?? INITIAL_HERO.subtitle,
        description: result.description ?? INITIAL_HERO.description,
        stats:
          typeof result.stats === "string"
            ? JSON.parse(result.stats) ?? INITIAL_HERO.stats
            : result.stats ?? INITIAL_HERO.stats,
        cta_text: result.cta_text ?? INITIAL_HERO.cta_text,
        cta_link: result.cta_link ?? INITIAL_HERO.cta_link,
        created_at: result.created_at ?? INITIAL_HERO.created_at,
        updated_at: result.updated_at ?? INITIAL_HERO.updated_at,
        updated_by: result.updated_by ?? INITIAL_HERO.updated_by,
      };
    }
    return INITIAL_HERO;
  } catch (error) {
    console.error("Error in fetchHeroContent:", error);
    return INITIAL_HERO;
  }
};

const fetchAboutContent = async (): Promise<AboutContent> => {
  try {
    const { data, error } = await supabaseClient.rpc("get_about_content");
    if (error) {
      console.error("Error fetching about content:", error);
      return INITIAL_ABOUT;
    }
    const result = (data as any)?.[0] as
      | Database["public"]["Tables"]["about_content"]["Row"]
      | undefined;
    if (result) {
      return {
        id: result.id ?? INITIAL_ABOUT.id,
        title: result.title ?? INITIAL_ABOUT.title,
        subtitle: result.subtitle ?? INITIAL_ABOUT.subtitle,
        founded_year: result.founded_year ?? INITIAL_ABOUT.founded_year,
        story: ensureStringArray(result.story) ?? INITIAL_ABOUT.story,
        features:
          typeof result.features === "string"
            ? JSON.parse(result.features) ?? INITIAL_ABOUT.features
            : result.features ?? INITIAL_ABOUT.features,
        created_at: result.created_at ?? INITIAL_ABOUT.created_at,
        updated_at: result.updated_at ?? INITIAL_ABOUT.updated_at,
        updated_by: result.updated_by ?? INITIAL_ABOUT.updated_by,
      };
    }
    return INITIAL_ABOUT;
  } catch (error) {
    console.error("Error in fetchAboutContent:", error);
    return INITIAL_ABOUT;
  }
};

const fetchSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const { data, error } = await supabaseClient.rpc("get_site_settings");
    if (error) {
      console.error("Error fetching site settings:", error);
      return INITIAL_SETTINGS;
    }
    const result = (data as any)?.[0] as
      | Database["public"]["Tables"]["site_settings"]["Row"]
      | undefined;
    if (result) {
      return {
        id: result.id ?? INITIAL_SETTINGS.id,
        site_name: result.site_name ?? INITIAL_SETTINGS.site_name,
        site_description:
          result.site_description ?? INITIAL_SETTINGS.site_description,
        tagline: result.tagline ?? INITIAL_SETTINGS.tagline,
        email: result.email ?? INITIAL_SETTINGS.email,
        phone: result.phone ?? INITIAL_SETTINGS.phone,
        address: result.address ?? INITIAL_SETTINGS.address,
        social_media: normalizeSocialLinks(result.social_media) as Record<
          string,
          string
        >,
        created_at: result.created_at ?? INITIAL_SETTINGS.created_at,
        updated_at: result.updated_at ?? INITIAL_SETTINGS.updated_at,
        updated_by: result.updated_by ?? INITIAL_SETTINGS.updated_by,
      };
    }
    return INITIAL_SETTINGS;
  } catch (error) {
    console.error("Error in fetchSiteSettings:", error);
    return INITIAL_SETTINGS;
  }
};

const fetchEvents = async (): Promise<PublicEventView[]> => {
  try {
    const { data, error } = await supabaseClient
      .from("public_events_view")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in fetchEvents:", error);
    return [];
  }
};

const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabaseClient
      .from("team_members")
      .select("*")
      .eq("status", "active")
      .order("display_order")
      .order("name");
    if (error) {
      console.error("Error fetching team members:", error);
      return INITIAL_TEAM;
    }
    return (data || []).map((row: any): TeamMember => ({
      id: row.id,
      name: row.name || '',
      title: row.title || row.role || undefined,
      bio: row.bio || undefined,
      avatar_url: row.avatar_url && row.avatar_url.trim().length > 0 ? row.avatar_url : null,
      email: row.email || undefined,
      status: row.status as 'active' | 'inactive' | undefined || undefined,
      social_links: normalizeSocialLinks(row.social_links),
      display_order: row.display_order || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (error) {
    console.error("Error in fetchTeamMembers:", error);
    return INITIAL_TEAM;
  }
};

const fetchPartners = async (): Promise<Partner[]> => {
  try {
    const { data, error } = await supabaseClient
      .from("partners")
      .select("*")
      .eq("status", "active")
      .order("name");
    if (error) {
      console.error("Error fetching partners:", error);
      return INITIAL_PARTNERS;
    }
    return (data || []) as Partner[];
  } catch (error) {
    console.error("Error in fetchPartners:", error);
    return INITIAL_PARTNERS;
  }
};

const fetchGallery = async (): Promise<GalleryImage[]> => {
  try {
    const { data, error } = await supabaseClient
      .from("gallery_items")
      .select("*")
      .order("display_order")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching gallery:", error);
      return INITIAL_GALLERY;
    }
    return (data || []) as GalleryImage[];
  } catch (error) {
    console.error("Error in fetchGallery:", error);
    return INITIAL_GALLERY;
  }
};

// Content context implementation
export const ContentContext = createContext<ContentContextType | null>(null);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  useAuth();
  const [events, setEvents] = useState<PublicEventView[]>([]);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
  const [about, setAbout] = useState<AboutContent>(INITIAL_ABOUT);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Check if we should use dummy data
  const useDummyData = import.meta.env.VITE_USE_DUMMY_DATA === 'true';

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      // If using dummy data, skip Supabase calls
      if (useDummyData) {
        console.log("Using dummy data instead of Supabase");
        setEvents(INITIAL_EVENTS);
        setPartners(INITIAL_PARTNERS);
        setGallery(INITIAL_GALLERY);
        setTeam(INITIAL_TEAM);
        setHero(INITIAL_HERO);
        setAbout(INITIAL_ABOUT);
        setSettings(INITIAL_SETTINGS);
        setLoading(false);
        return;
      }

      try {
        const [
          eventsData,
          partnersData,
          galleryData,
          teamData,
          heroData,
          aboutData,
          settingsData,
        ] = await Promise.all([
          fetchEvents(),
          fetchPartners(),
          fetchGallery(),
          fetchTeamMembers(),
          fetchHeroContent(),
          fetchAboutContent(),
          fetchSiteSettings(),
        ]);
        setEvents(eventsData);
        setPartners(partnersData);
        setGallery(galleryData);
        setTeam(teamData);
        setHero(heroData);
        setAbout(aboutData);
        setSettings(settingsData);
      } catch (err) {
        console.error("Error initializing content:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);









  // Event Artists mutations - placeholder implementation
  const fetchEventArtists = async (eventId: string): Promise<EventArtist[]> => {
    try {
      const { data, error } = await supabaseClient
        .from("public_events_view")
        .select("artists")
        .eq("id", eventId)
        .single();

      if (error) throw error;

      // Convert artists JSON to EventArtist[]
      if (data?.artists) {
        return Array.isArray(data.artists)
          ? data.artists.map((a: any) => ({
              name: a.name || "",
              role: a.role || undefined,
              image: a.image || undefined,
            }))
          : [];
      }
      return [];
    } catch (err) {
      console.error("Error fetching event artists:", err);
      throw err;
    }
  };

  const addEventArtist = async () => {
    console.warn(
      "addEventArtist: Not implemented - artists field not in events table"
    );
    await Promise.resolve();
  };

  const updateEventArtist = async () => {
    console.warn(
      "updateEventArtist: Not implemented - artists field not in events table"
    );
    await Promise.resolve();
  };

  const deleteEventArtist = async () => {
    console.warn(
      "deleteEventArtist: Not implemented - artists field not in events table"
    );
    await Promise.resolve();
  };



  const value: ContentContextType = {
    publicContent: {},
    events: events as PublicEventView[],
    partners,
    gallery,
    team,
    hero,
    about,
    settings,
    loading,
    fetchEvents: async () => {},
    fetchPartners: async () => {},
    fetchGallery: async () => {},
    fetchTeam: async () => {},
    fetchHeroContent: async () => {},
    fetchAboutContent: async () => {},
    fetchSiteSettings: async () => {},
    fetchPublicContent: async () => {},
    saveHeroContent: async () => {},
    saveAboutContent: async () => {},
    saveSiteSettings: async () => {},
    addEvent: async () => {},
    updateEvent: async () => {},
    deleteEvent: async () => {},
    addGalleryImage: async () => {},
    updateGalleryImage: async () => {},
    deleteGalleryImage: async () => {},
    addTeamMember: async () => {},
    updateTeamMember: async () => {},
    deleteTeamMember: async () => {},
    addPartner: async () => {},
    updatePartner: async () => {},
    deletePartner: async () => {},
    fetchEventArtists,
    addEventArtist,
    updateEventArtist,
    deleteEventArtist,
    refreshData: async () => {},
    // Admin sections not in ContentContextType
    // adminSections,
    // sectionContent,
    // adminSectionsLoading,
    // getSectionContent,
    // getSectionPermissions,
    // updateSectionContent,
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be within ContentProvider");
  return context;
};
