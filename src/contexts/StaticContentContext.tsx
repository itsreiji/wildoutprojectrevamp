import type {
    AboutContent,
    AdminSection,
    GalleryImage,
    HeroContent,
    SectionContent,
    SectionPermissions,
    SiteSettings,
} from "@/types/content";
import React, {
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
import { cleanupGalleryAsset } from "../utils/storageHelpers";
import type { AuthRole } from "./AuthContext";
import { useAuth } from "./AuthContext";

// Initial data
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
const INITIAL_GALLERY: GalleryImage[] = [];

const ensureStringArray = (value: Json | undefined): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return undefined;
};

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

interface StaticContentContextType {
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
  gallery: GalleryImage[];
  adminSections: AdminSection[];
  sectionContent: Record<string, SectionContent>;
  loading: boolean;
  adminSectionsLoading: boolean;
  error: string | null;
  updateHero: React.Dispatch<React.SetStateAction<HeroContent>>;
  updateAbout: React.Dispatch<React.SetStateAction<AboutContent>>;
  updateSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  updateGallery: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
  saveHeroContent: (content: HeroContent) => Promise<void>;
  saveAboutContent: (content: AboutContent) => Promise<void>;
  saveSiteSettings: (settings: SiteSettings) => Promise<void>;
  addGalleryImage: (
    item: TablesInsert<"gallery_items">
  ) => Promise<GalleryImage>;
  updateGalleryImage: (
    id: string,
    updates: TablesUpdate<"gallery_items">,
    oldImageUrls?: string[] | null
  ) => Promise<GalleryImage>;
  deleteGalleryImage: (id: string) => Promise<void>;
  getSectionContent: (sectionSlug: string) => SectionContent | null;
  getSectionPermissions: (sectionSlug: string) => SectionPermissions;
  updateSectionContent: (sectionSlug: string, content: Json) => Promise<void>;
  refreshStaticContent: () => Promise<void>;
}

const StaticContentContext = createContext<
  StaticContentContextType | undefined
>(undefined);

export const StaticContentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const authContext = useAuth();
  const user = authContext.user;
  const role: AuthRole = authContext.role;

  const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
  const [about, setAbout] = useState<AboutContent>(INITIAL_ABOUT);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
  const [adminSections, setAdminSections] = useState<AdminSection[]>([]);
  const [sectionContent, setSectionContent] = useState<
    Record<string, SectionContent>
  >({});
  const [loading, setLoading] = useState(true);
  const [adminSectionsLoading, setAdminSectionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchGallery = async (): Promise<GalleryImage[]> => {
    try {
      const { data, error } = await supabaseClient
        .from("gallery_items")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching gallery:", error);
        return INITIAL_GALLERY;
      }
      return (data || []).map((row: any) => ({
        id: row.id || "",
        title: row.title || "",
        description: row.description ?? null,
        image_url: row.image_url || "",
        category: row.category || "",
        status: row.status || "published",
        tags: row.tags || [],
        display_order: row.display_order ?? null,
        event_id: row.event_id ?? null,
        metadata: row.metadata ?? {},
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error in fetchGallery:", error);
      return INITIAL_GALLERY;
    }
  };

  const loadStaticContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const [heroData, aboutData, settingsData, galleryData] =
        await Promise.all([
          fetchHeroContent(),
          fetchAboutContent(),
          fetchSiteSettings(),
          fetchGallery(),
        ]);
      setHero(heroData);
      setAbout(aboutData);
      setSettings(settingsData);
      setGallery(galleryData);
    } catch (err) {
      console.error("Error loading static content:", err);
      setError("Failed to load static content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaticContent();
  }, []);

  // Load admin sections
  useEffect(() => {
    const loadAdminSections = async () => {
      try {
        setAdminSectionsLoading(true);
        const { data: sections, error: sectionsError } =
          await supabaseClient.rpc("get_admin_sections_for_user", {
            p_user_id: user?.id,
          });

        if (sectionsError) {
          console.error("Error fetching admin sections:", sectionsError);
          // Fallback to hardcoded sections
          setAdminSections([
            {
              id: "home-id",
              slug: "home",
              label: "Dashboard",
              icon: "LayoutDashboard",
              category: "main",
              order_index: 1,
              enabled: true,
              description:
                "Overview dashboard with statistics and recent activity",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null,
            },
            {
              id: "hero-id",
              slug: "hero",
              label: "Hero Section",
              icon: "Sparkles",
              category: "content",
              order_index: 2,
              enabled: true,
              description:
                "Landing page hero section with title, subtitle, and call-to-action",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null,
            },
            {
              id: "about-id",
              slug: "about",
              label: "About Us",
              icon: "Info",
              category: "content",
              order_index: 3,
              enabled: true,
              description: "About page content including story and features",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null,
            },
            {
              id: "events-id",
              slug: "events",
              label: "Events",
              icon: "Calendar",
              category: "content",
              order_index: 4,
              enabled: true,
              description: "Manage events, categories, and event details",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null,
            },
            {
              id: "team-id",
              slug: "team",
              label: "Team",
              icon: "Users",
              category: "content",
              order_index: 5,
              enabled: true,
              description: "Team members and their information",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null,
            },
            {
              id: "gallery-id",
              slug: "gallery",
              label: "Gallery",
              icon: "Image",
              category: "content",
              order_index: 6,
              enabled: true,
              description: "Image gallery items and management",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null,
            },
            {
              id: "partners-id",
              slug: "partners",
              label: "Partners",
              icon: "Handshake",
              category: "content",
              order_index: 7,
              enabled: true,
              description: "Partner organizations and collaborations",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null,
            },
            {
              id: "settings-id",
              slug: "settings",
              label: "Settings",
              icon: "Settings",
              category: "management",
              order_index: 8,
              enabled: true,
              description: "Site-wide settings and configuration",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null,
            },
          ]);
        } else {
          // Add missing properties to match AdminSection type
          const sectionsWithFullType = Object.keys(sections || {})
            .map((k) => (sections as any)[k])
            .map((section) => ({
              ...section,
              created_at: new Date().toISOString(),
              created_by: null,
              enabled: true,
              updated_at: new Date().toISOString(),
              updated_by: null,
            }));
          setAdminSections(sectionsWithFullType);
        }

        const contentMap: Record<string, SectionContent> = {};
        const sectionsWithContent = [
          "home",
          "events",
          "team",
          "gallery",
          "partners",
          "settings",
        ];

        for (const sectionSlug of sectionsWithContent) {
          try {
            const { data: content, error: contentError } =
              await supabaseClient.rpc("get_section_content", {
                p_section_slug: sectionSlug,
                p_user_id: user?.id,
              });

            if (!contentError && content && content.length > 0) {
              const contentData = content[0] as any;
              contentMap[sectionSlug] = {
                ...contentData,
                p_section_slug: sectionSlug,
                created_at: contentData.created_at || null,
                created_by: contentData.created_by || null,
                id: contentData.id || "",
                is_active: contentData.is_active || true,
                section_id: contentData.section_id || "",
                version: contentData.version || 1,
                payload: contentData.payload || {},
                updated_at: contentData.updated_at || new Date().toISOString(),
                updated_by: contentData.updated_by || "",
              };
            }
          } catch (err) {
            console.warn(
              `Failed to fetch content for section ${sectionSlug}:`,
              err
            );
          }
        }
        setSectionContent(contentMap);
      } catch (error) {
        console.error("Error loading admin sections:", error);
      } finally {
        setAdminSectionsLoading(false);
      }
    };

    loadAdminSections();
  }, [user?.id]);

  const saveHeroContent = async (content: HeroContent): Promise<void> => {
    try {
      setError(null);
      if (!user) throw new Error("User not authenticated");
      if (role !== "admin")
        throw new Error(`Insufficient permissions. User role: ${role}`);

      const saveData = {
        ...content,
        description:
          typeof content.description === "string" ? content.description : "",
        stats: typeof content.stats === "string" ? content.stats : "",
        id: "00000000-0000-0000-0000-000000000001",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseClient
        .from("hero_content")
        .upsert(saveData);

      if (error) {
        console.error("Database error:", error);
        setError(`Failed to save hero content: ${error.message}`);
        throw error;
      }

      setHero(content);
    } catch (err) {
      console.error("Error in saveHeroContent:", err);
      setError(
        `Failed to save hero content: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      throw err;
    }
  };

  const saveAboutContent = async (content: AboutContent): Promise<void> => {
    try {
      setError(null);
      if (!user) throw new Error("User not authenticated");
      if (role !== "admin")
        throw new Error(`Insufficient permissions. User role: ${role}`);

      const saveData = {
        id: "00000000-0000-0000-0000-000000000002",
        title: content.title,
        subtitle: content.subtitle,
        founded_year: content.founded_year,
        story: content.story,
        features: content.features,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseClient
        .from("about_content")
        .upsert(saveData);

      if (error) {
        console.error("Database error:", error);
        setError(`Failed to save about content: ${error.message}`);
        throw error;
      }

      setAbout(content);
    } catch (err) {
      console.error("Error in saveAboutContent:", err);
      setError(
        `Failed to save about content: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      throw err;
    }
  };

  const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
    try {
      setError(null);
      if (!user) throw new Error("User not authenticated");
      if (role !== "admin")
        throw new Error(`Insufficient permissions. User role: ${role}`);

      const saveData = {
        id: "00000000-0000-0000-0000-000000000003",
        site_name: settings.site_name,
        site_description: settings.site_description,
        tagline: settings.tagline,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        social_media: settings.social_media,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseClient
        .from("site_settings")
        .upsert(saveData);

      if (error) {
        console.error("Database error:", error);
        setError(`Failed to save site settings: ${error.message}`);
        throw error;
      }

      setSettings(settings);
    } catch (err) {
      console.error("Error in saveSiteSettings:", err);
      setError(
        `Failed to save site settings: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      throw err;
    }
  };

  const addGalleryImage = async (
    item: TablesInsert<"gallery_items">
  ): Promise<GalleryImage> => {
    try {
      setError(null);
      const { data, error } = await supabaseClient
        .from("gallery_items")
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error("Error adding gallery image:", error);
        setError(`Failed to add gallery image: ${error.message}`);
        throw error;
      }

      if (data) {
        setGallery(
          (prev) =>
            [
              ...prev,
              {
                ...(data as any),
                tags: data?.tags || [],
              } as GalleryImage,
            ] as GalleryImage[]
        );
        return {
          ...(data as any),
          tags: data?.tags || [],
        } as GalleryImage;
      }
      throw new Error("No data returned from insert operation");
    } catch (err) {
      console.error("Error in addGalleryImage:", err);
      setError("Failed to add gallery image");
      throw err;
    }
  };

  const updateGalleryImage = async (
    id: string,
    updates: TablesUpdate<"gallery_items">,
    oldImageUrls?: string[] | null
  ): Promise<GalleryImage> => {
    try {
      setError(null);
      const { data, error } = await supabaseClient
        .from("gallery_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating gallery image:", error);
        setError(`Failed to update gallery image: ${error.message}`);
        throw error;
      }

      // Note: image_urls is not part of GalleryImage type, using metadata instead
      if (oldImageUrls && (updates as any).image_urls) {
        // Note: image_urls is not part of GalleryImage type, cleanup handled via image_url
        if (
          oldImageUrls &&
          Array.isArray(oldImageUrls) &&
          oldImageUrls.length > 0
        ) {
          await cleanupGalleryAsset(oldImageUrls);
        }
      }

      if (data) {
        setGallery((prev) =>
          prev.map((image) =>
            image.id === id
              ? ({
                  id: data.id || "",
                  title: data.title || "",
                  description: data.description ?? null,
                  image_url: data.image_url || "",
                  category: data.category || "",
                  status: data.status || "published",
                  tags: data.tags || [],
                  display_order: data.display_order ?? null,
                  event_id: data.event_id ?? null,
                  metadata: data.metadata ?? {},
                  created_at: data.created_at || new Date().toISOString(),
                  updated_at: data.updated_at || new Date().toISOString(),
                } as GalleryImage)
              : image
          )
        );
        return {
          id: data.id || "",
          title: data.title || "",
          description: data.description ?? null,
          image_url: data.image_url || "",
          category: data.category || "",
          status: data.status || "published",
          tags: data.tags || [],
          display_order: data.display_order ?? null,
          event_id: data.event_id ?? null,
          metadata: data.metadata ?? {},
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        } as GalleryImage;
      }
      throw new Error("No data returned from update operation");
    } catch (err) {
      console.error("Error in updateGalleryImage:", err);
      setError("Failed to update gallery image");
      throw err;
    }
  };

  const deleteGalleryImage = async (id: string): Promise<void> => {
    try {
      setError(null);
      const itemToDelete = gallery.find((item) => item.id === id);
      const { error } = await supabaseClient
        .from("gallery_items")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting gallery item:", error);
        setError(`Failed to delete gallery item: ${error.message}`);
        throw error;
      }

      // Note: image_urls is not part of GalleryImage type, using metadata or image_url for cleanup
      if (
        itemToDelete?.image_url &&
        typeof itemToDelete.image_url === "string"
      ) {
        await cleanupGalleryAsset([itemToDelete.image_url]);
      }

      setGallery((prev) => prev.filter((image) => image.id !== id));
    } catch (err) {
      console.error("Error in deleteGalleryImage:", err);
      setError("Failed to delete gallery item");
      throw err;
    }
  };

  const getSectionContent = (sectionSlug: string): SectionContent | null => {
    return sectionContent[sectionSlug] || null;
  };

  const getSectionPermissions = (sectionSlug: string): SectionPermissions => {
    return {
      canView: true,
      canEdit: true,
      canPublish: true,
      canDelete: true,
    };
  };

  const updateSectionContent = async (
    sectionSlug: string,
    content: any
  ): Promise<void> => {
    try {
      setError(null);
      const { data, error } = await supabaseClient.rpc(
        "update_section_content",
        {
          section_slug: sectionSlug,
          new_payload: content,
        }
      );

      if (error) {
        console.error("Error updating section content:", error);
        setError(`Failed to update section content: ${error.message}`);
        throw error;
      }

      setSectionContent((prev) => ({
        ...prev,
        [sectionSlug]: {
          ...prev[sectionSlug],
          payload: content,
          updated_at: new Date().toISOString(),
        },
      }));
    } catch (err) {
      console.error("Error in updateSectionContent:", err);
      setError("Failed to update section content");
      throw err;
    }
  };

  const value = {
    hero,
    about,
    settings,
    gallery,
    adminSections,
    sectionContent,
    loading,
    adminSectionsLoading,
    error,
    updateHero: setHero,
    updateAbout: setAbout,
    updateSettings: setSettings,
    updateGallery: setGallery,
    saveHeroContent,
    saveAboutContent,
    saveSiteSettings,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    getSectionContent,
    getSectionPermissions,
    updateSectionContent,
    refreshStaticContent: loadStaticContent,
  };

  return (
    <StaticContentContext.Provider value={value}>
      {children}
    </StaticContentContext.Provider>
  );
};

export const useStaticContent = () => {
  const context = useContext(StaticContentContext);
  if (!context)
    throw new Error(
      "useStaticContent must be used within StaticContentProvider"
    );
  return context;
};
