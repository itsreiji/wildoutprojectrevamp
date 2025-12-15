/* @refresh reset */
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabaseClient } from "../supabase/client";
import type {
  Database,
  Json,
  TablesInsert,
  TablesUpdate,
} from "../supabase/types";
import { useAuth } from "./AuthContext";

import type {
  AboutContent,
  AdminSection,
  ContentContextType,
  EventArtist,
  GalleryImage,
  HeroContent,
  LandingEvent,
  Partner,
  PublicEventView,
  SectionContent,
  SectionPermissions,
  SiteSettings,
  TeamMember,
} from "@/types/content";
import {
  cleanupEventAssets,
  cleanupGalleryAsset,
  cleanupPartnerAsset,
  cleanupTeamMemberAsset,
} from "../utils/storageHelpers";

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
const INITIAL_EVENTS: LandingEvent[] = [];
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
  email: "contact@wildout.id",
  phone: "+62 21 1234 567",
  address: "Jakarta, Indonesia",
  social_media: {
    instagram: "https://instagram.com/wildout.id",
    twitter: "https://twitter.com/wildout_id",
    facebook: "https://facebook.com/wildout.id",
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
    return (data || []) as TeamMember[];
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
  const { user, role: userRole } = useAuth();
  const [events, setEvents] = useState<PublicEventView[]>([]);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
  const [about, setAbout] = useState<AboutContent>(INITIAL_ABOUT);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin sections data
  const [adminSections, setAdminSections] = useState<AdminSection[]>([]);
  const [sectionContent, setSectionContent] = useState<
    Record<string, SectionContent>
  >({});
  const [adminSectionsLoading, setAdminSectionsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
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
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Fetch admin sections
  useEffect(() => {
    const initializeAdminSections = async () => {
      if (!user || userRole !== "admin") {
        setAdminSections([]);
        setSectionContent({});
        return;
      }

      setAdminSectionsLoading(true);
      try {
        // Use RPC to get sections enabled for the user
        const { data, error } = await supabaseClient.rpc(
          "get_admin_sections_for_user",
          { user_id: user.id }
        );

        if (error) {
          console.error("Error fetching admin sections:", error);
          return;
        }

        const sections = (data || []).map(
          (
            row: Database["public"]["Functions"]["get_admin_sections_for_user"]["Returns"][number]
          ) => ({
            category: row.category,
            created_at: null,
            created_by: null,
            description: row.description ?? null,
            enabled: true, // RPC doesn't return enabled field
            icon: row.icon,
            id: row.id,
            label: row.label,
            order_index: row.order_index,
            slug: row.slug,
            updated_at: null,
            updated_by: null,
          })
        );

        setAdminSections(sections);

        // Fetch section content using RPC
        const contentPromises = sections.map(async (section: any) => {
          const { data, error } = await supabaseClient.rpc(
            "get_section_content",
            {
              section_slug: section.slug,
              user_id: user.id,
            }
          );

          if (error) {
            console.error(
              `Error fetching section content for ${section.slug}:`,
              error
            );
            return {
              sectionId: section.id,
              sectionSlug: section.slug,
              content: null,
            };
          }

          // RPC returns an array, take the first item if available
          const contentData =
            data && data.length > 0 ? (data[0] as SectionContent) : null;

          return {
            sectionId: section.id,
            sectionSlug: section.slug,
            content: contentData,
          };
        });

        const contentResults = await Promise.all(contentPromises);
        const newSectionContent: Record<string, SectionContent> = {};
        contentResults.forEach(({ sectionSlug, content }) => {
          if (content && sectionSlug) {
            newSectionContent[sectionSlug] = content;
          }
        });

        setSectionContent(newSectionContent);
      } catch (err) {
        console.error("Error initializing admin sections:", err);
      } finally {
        setAdminSectionsLoading(false);
      }
    };

    initializeAdminSections();
  }, [user, userRole]);

  // Event mutations
  const addEvent = async (event: TablesInsert<"events">) => {
    try {
      const { data, error } = await supabaseClient
        .from("events")
        .insert(event)
        .select()
        .single();

      if (error) throw error;

      setEvents((prev) => [...prev, data as unknown as PublicEventView]);
      return data;
    } catch (err) {
      console.error("Error adding event:", err);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: TablesUpdate<"events">) => {
    try {
      const { data, error } = await supabaseClient
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setEvents((prev) =>
        prev.map((event) =>
          event.id === id ? (data as unknown as PublicEventView) : event
        )
      );
      return data;
    } catch (err) {
      console.error("Error updating event:", err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const itemToDelete = events.find((event) => event.id === id);
      if (itemToDelete?.image_url) {
        await cleanupEventAssets(itemToDelete.image_url);
      }

      const { error } = await supabaseClient
        .from("events")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
      throw err;
    }
  };

  // Team member mutations
  const addTeamMember = async (member: TablesInsert<"team_members">) => {
    try {
      const { data, error } = await supabaseClient
        .from("team_members")
        .insert(member)
        .select()
        .single();

      if (error) throw error;

      setTeam((prev) => [...prev, data as unknown as TeamMember]);
      return data;
    } catch (err) {
      console.error("Error adding team member:", err);
      throw err;
    }
  };

  const updateTeamMember = async (
    id: string,
    updates: TablesUpdate<"team_members">
  ) => {
    try {
      const { data, error } = await supabaseClient
        .from("team_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setTeam((prev) =>
        prev.map((member) =>
          member.id === id ? (data as unknown as TeamMember) : member
        )
      );
      return data;
    } catch (err) {
      console.error("Error updating team member:", err);
      throw err;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const itemToDelete = team.find((member) => member.id === id);
      if (itemToDelete?.avatar_url) {
        await cleanupTeamMemberAsset(itemToDelete.avatar_url);
      }

      const { error } = await supabaseClient
        .from("team_members")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setTeam((prev) => prev.filter((member) => member.id !== id));
    } catch (err) {
      console.error("Error deleting team member:", err);
      throw err;
    }
  };

  // Partner mutations
  const addPartner = async (partner: TablesInsert<"partners">) => {
    try {
      const { data, error } = await supabaseClient
        .from("partners")
        .insert(partner)
        .select()
        .single();

      if (error) throw error;

      setPartners((prev) => [...prev, data as unknown as Partner]);
      return data;
    } catch (err) {
      console.error("Error adding partner:", err);
      throw err;
    }
  };

  const updatePartner = async (
    id: string,
    updates: TablesUpdate<"partners">
  ) => {
    try {
      const { data, error } = await supabaseClient
        .from("partners")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setPartners((prev) =>
        prev.map((partner) =>
          partner.id === id ? (data as unknown as Partner) : partner
        )
      );
      return data;
    } catch (err) {
      console.error("Error updating partner:", err);
      throw err;
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const itemToDelete = partners.find((partner) => partner.id === id);
      if (itemToDelete?.logo_url) {
        await cleanupPartnerAsset(itemToDelete.logo_url);
      }

      const { error } = await supabaseClient
        .from("partners")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setPartners((prev) => prev.filter((partner) => partner.id !== id));
    } catch (err) {
      console.error("Error deleting partner:", err);
      throw err;
    }
  };

  // Gallery mutations
  const addGalleryImage = async (image: TablesInsert<"gallery_items">) => {
    try {
      const { data, error } = await supabaseClient
        .from("gallery_items")
        .insert(image)
        .select()
        .single();

      if (error) throw error;

      setGallery((prev) => [...prev, data as unknown as GalleryImage]);
      return data;
    } catch (err) {
      console.error("Error adding gallery image:", err);
      throw err;
    }
  };

  const updateGalleryImage = async (
    id: string,
    updates: TablesUpdate<"gallery_items">
  ) => {
    try {
      const { data, error } = await supabaseClient
        .from("gallery_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setGallery((prev) =>
        prev.map((image) =>
          image.id === id ? (data as unknown as GalleryImage) : image
        )
      );
      return data;
    } catch (err) {
      console.error("Error updating gallery image:", err);
      throw err;
    }
  };

  const deleteGalleryImage = async (id: string) => {
    try {
      const itemToDelete = gallery.find((image) => image.id === id);
      if (itemToDelete?.image_url) {
        await cleanupGalleryAsset(itemToDelete.image_url);
      }

      const { error } = await supabaseClient
        .from("gallery_items")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setGallery((prev) => prev.filter((image) => image.id !== id));
    } catch (err) {
      console.error("Error deleting gallery image:", err);
      throw err;
    }
  };

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

  const addEventArtist = async (artist: EventArtist) => {
    console.warn(
      "addEventArtist: Not implemented - artists field not in events table"
    );
    await Promise.resolve();
  };

  const updateEventArtist = async (id: string, artist: EventArtist) => {
    console.warn(
      "updateEventArtist: Not implemented - artists field not in events table"
    );
    await Promise.resolve();
  };

  const deleteEventArtist = async (id: string) => {
    console.warn(
      "deleteEventArtist: Not implemented - artists field not in events table"
    );
    await Promise.resolve();
  };

  // Content mutations
  const saveHeroContent = async (content: HeroContent) => {
    try {
      const { data, error } = await supabaseClient
        .from("hero_content")
        .upsert({
          ...content,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setHero(data);
      return data;
    } catch (err) {
      console.error("Error saving hero content:", err);
      throw err;
    }
  };

  const saveAboutContent = async (content: AboutContent) => {
    try {
      const { data, error } = await supabaseClient
        .from("about_content")
        .upsert({
          ...content,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setAbout(data);
      return data;
    } catch (err) {
      console.error("Error saving about content:", err);
      throw err;
    }
  };

  const saveSiteSettings = async (settings: SiteSettings) => {
    try {
      const { data, error } = await supabaseClient
        .from("site_settings")
        .upsert({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      return data;
    } catch (err) {
      console.error("Error saving site settings:", err);
      throw err;
    }
  };

  // Admin sections methods
  const getSectionContent = (sectionId: string): SectionContent | null => {
    return sectionContent[sectionId] || null;
  };

  const getSectionPermissions = (sectionId: string): SectionPermissions[] => {
    const section = adminSections.find((s) => s.id === sectionId);
    // TODO: Add permissions field to AdminSection type in types/content.ts
    return [];
  };

  const updateSectionContent = async (
    sectionId: string,
    content: SectionContent
  ) => {
    try {
      const { data, error } = await supabaseClient
        .from("section_content")
        .upsert({
          ...content,
          section_id: sectionId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSectionContent((prev) => ({
        ...prev,
        [sectionId]: {
          ...data,
          section_slug: sectionId,
        },
      }));

      return data;
    } catch (err) {
      console.error("Error updating section content:", err);
      throw err;
    }
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
