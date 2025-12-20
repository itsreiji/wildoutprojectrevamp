/* @refresh reset */
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import supabaseClient, { useDummyData } from "../supabase/client";
import type {
    Database,
    Json,
} from "../supabase/types";
import { useAuth } from "./AuthContext";
import {
  MOCK_HERO,
  MOCK_ABOUT,
  MOCK_SETTINGS,
  MOCK_EVENTS,
  MOCK_GALLERY,
  MOCK_TEAM,
  MOCK_PARTNERS
} from "../utils/mockData";

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

// Fetch functions using content.ts types
const fetchHeroContent = async (): Promise<HeroContent | null> => {
  try {
    const { data, error } = await supabaseClient.rpc("get_hero_content");
    if (error) {
      console.error("Error fetching hero content:", error);
      return null;
    }
    const result = (data as any)?.[0] as
      | Database["public"]["Tables"]["hero_content"]["Row"]
      | undefined;
    if (result) {
      return {
        id: result.id,
        title: result.title ?? "",
        subtitle: result.subtitle ?? "",
        description: result.description ?? "",
        stats:
          result.stats && typeof result.stats === "object"
            ? (result.stats as any)
            : {},
        cta_text: result.cta_text ?? "",
        cta_link: result.cta_link ?? "",
        created_at: result.created_at,
        updated_at: result.updated_at,
        updated_by: result.updated_by,
      };
    }
    return null;
  } catch (error) {
    console.error("Error in fetchHeroContent:", error);
    return null;
  }
};

const fetchAboutContent = async (): Promise<AboutContent | null> => {
  try {
    const { data, error } = await supabaseClient.rpc("get_about_content");
    if (error) {
      console.error("Error fetching about content:", error);
      return null;
    }
    const result = (data as any)?.[0] as
      | Database["public"]["Tables"]["about_content"]["Row"]
      | undefined;
    if (result) {
      return {
        id: result.id,
        title: result.title ?? "",
        subtitle: result.subtitle ?? "",
        founded_year: result.founded_year ?? "",
        story: ensureStringArray(result.story) ?? [],
        features:
          result.features && typeof result.features === "object"
            ? (result.features as any)
            : [],
        created_at: result.created_at,
        updated_at: result.updated_at,
        updated_by: result.updated_by,
      };
    }
    return null;
  } catch (error) {
    console.error("Error in fetchAboutContent:", error);
    return null;
  }
};

const fetchSiteSettings = async (): Promise<SiteSettings | null> => {
  try {
    const { data, error } = await supabaseClient.rpc("get_site_settings");
    if (error) {
      console.error("Error fetching site settings:", error);
      return null;
    }
    const result = (data as any)?.[0] as
      | Database["public"]["Tables"]["site_settings"]["Row"]
      | undefined;
    if (result) {
      return {
        id: result.id,
        site_name: result.site_name ?? "",
        site_description: result.site_description ?? "",
        tagline: result.tagline ?? "",
        email: result.email ?? "",
        phone: result.phone ?? "",
        address: result.address ?? "",
        social_media: normalizeSocialLinks(result.social_media) as Record<
          string,
          string
        >,
        created_at: result.created_at,
        updated_at: result.updated_at,
        updated_by: result.updated_by,
      };
    }
    return null;
  } catch (error) {
    console.error("Error in fetchSiteSettings:", error);
    return null;
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
      return [];
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
    return [];
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
      return [];
    }
    return (data || []) as Partner[];
  } catch (error) {
    console.error("Error in fetchPartners:", error);
    return [];
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
      return [];
    }
    return (data || []) as GalleryImage[];
  } catch (error) {
    console.error("Error in fetchGallery:", error);
    return [];
  }
};

// Content context implementation
export const ContentContext = createContext<ContentContextType | null>(null);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  useAuth();
  const [events, setEvents] = useState<PublicEventView[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      if (useDummyData) {
        console.log("Using mock data for content initialization");
        setEvents(MOCK_EVENTS);
        setPartners(MOCK_PARTNERS);
        setGallery(MOCK_GALLERY);
        setTeam(MOCK_TEAM);
        setHero(MOCK_HERO);
        setAbout(MOCK_ABOUT);
        setSettings(MOCK_SETTINGS);
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
