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
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { supabaseClient, useDummyData } from "../supabase/client";
import type {
    Database,
    Json,
    TablesInsert,
    TablesUpdate,
} from "../supabase/types";
import { cleanupGalleryAsset } from "../utils/storageHelpers";
import type { AuthRole } from "./AuthContext";
import { useAuth } from "./AuthContext";
import {
  MOCK_HERO,
  MOCK_ABOUT,
  MOCK_SETTINGS,
  MOCK_GALLERY
} from "../utils/mockData";

// Initial data
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
  hero: HeroContent | null;
  about: AboutContent | null;
  settings: SiteSettings | null;
  gallery: GalleryImage[];
  adminSections: AdminSection[];
  sectionContent: Record<string, SectionContent>;
  loading: boolean;
  adminSectionsLoading: boolean;
  error: string | null;
  updateHero: React.Dispatch<React.SetStateAction<HeroContent | null>>;
  updateAbout: React.Dispatch<React.SetStateAction<AboutContent | null>>;
  updateSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
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

  const [hero, setHero] = useState<HeroContent | null>(null);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [adminSections, setAdminSections] = useState<AdminSection[]>([]);
  const [sectionContent, setSectionContent] = useState<
    Record<string, SectionContent>
  >({});
  const [loading, setLoading] = useState(true);
  const [adminSectionsLoading, setAdminSectionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            typeof result.stats === "string"
              ? JSON.parse(result.stats)
              : result.stats || {},
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
          story: ensureStringArray(result.story) || [],
          features:
            typeof result.features === "string"
              ? JSON.parse(result.features)
              : result.features || [],
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

  const fetchGallery = async (): Promise<GalleryImage[]> => {
    try {
      const { data, error } = await supabaseClient
        .from("gallery_items")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching gallery:", error);
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id || "",
        title: row.title || "",
        description: row.description ?? null,
        image_url: row.image_url && row.image_url.trim().length > 0 ? row.image_url : "",
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
      return [];
    }
  };

  const loadStaticContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (useDummyData) {
        console.log("Using mock data for static content initialization");
        setHero(MOCK_HERO);
        setAbout(MOCK_ABOUT);
        setSettings(MOCK_SETTINGS);
        setGallery(MOCK_GALLERY);
        setLoading(false);
        return;
      }

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
  }, []);

  useEffect(() => {
    loadStaticContent();
  }, [loadStaticContent]);

  // Load admin sections
  useEffect(() => {
    const loadAdminSections = async () => {
      try {
        setAdminSectionsLoading(true);

        if (useDummyData) {
          setAdminSections([]);
          setSectionContent({});
          setAdminSectionsLoading(false);
          return;
        }

        const { data: sections, error: sectionsError } =
          await supabaseClient.rpc("get_admin_sections_for_user", {
            p_user_id: user?.id,
          });

        if (sectionsError) {
          console.error("Error fetching admin sections:", sectionsError);
          setAdminSections([]);
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
                  image_url: data.image_url && data.image_url.trim().length > 0 ? data.image_url : "",
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
          image_url: data.image_url && data.image_url.trim().length > 0 ? data.image_url : "",
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

  const getSectionPermissions = (_sectionSlug: string): SectionPermissions => {
     return {
       canView: true,
       canEdit: true,
       canPublish: true,
       canDelete: true,
     };
   };

  const updateSectionContent = async (sectionSlug: string, content: any) => {
    try {
      const { error } = await supabaseClient.rpc(
        "update_section_content",
        {
          p_section_slug: sectionSlug,
          p_content: content,
          p_user_id: user?.id,
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
