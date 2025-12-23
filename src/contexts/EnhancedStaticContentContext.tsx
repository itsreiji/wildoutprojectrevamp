/**
 * Enhanced Static Content Context with Supabase Storage Integration
 *
 * This extends the existing StaticContentContext to integrate with the new
 * Supabase Storage-based gallery system while maintaining backward compatibility.
 */

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

// Import new storage service
import { galleryStorageService } from "@/lib/gallery/storage-service";

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
  if (Array.isArray(value) || typeof value === "number" || typeof value === "boolean") return {};
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

interface EnhancedStaticContentContextType {
  hero: HeroContent | null;
  about: AboutContent | null;
  settings: SiteSettings | null;
  gallery: GalleryImage[];
  adminSections: AdminSection[];
  sectionContent: Record<string, SectionContent>;
  loading: boolean;
  adminSectionsLoading: boolean;
  error: string | null;

  // Original functions
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

  // NEW: Enhanced storage functions
  uploadGalleryFiles: (files: File[]) => Promise<Array<{
    path: string;
    url: string;
    fileName: string;
    success: boolean;
    error?: string;
    metadata?: {
      size: number;
      width: number;
      height: number;
      mime_type: string;
      format: string;
    };
  }>>;
  getStorageStats: () => Promise<any>;
  checkStorageConsistency: () => Promise<any>;
  cleanupOrphanedFiles: () => Promise<any>;
  getGalleryItemsPaginated: (page?: number, limit?: number, filters?: any) => Promise<any>;
}

const EnhancedStaticContentContext = createContext<
  EnhancedStaticContentContextType | undefined
>(undefined);

export const EnhancedStaticContentProvider: React.FC<{ children: ReactNode }> = ({
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

  // Original fetch functions remain the same
  const fetchHeroContent = async (): Promise<HeroContent | null> => {
    try {
      if (useDummyData) {
        return MOCK_HERO;
      }
      const { data, error } = await supabaseClient.rpc("get_hero_content");
      if (error) {
        console.error("Error fetching hero content:", error);
        return null;
      }
      const result = (data as any)?.[0] as
        | Database["public"]["Tables"]["hero_content"]["Row"]
        | undefined;
      if (result) {
        console.log('EnhancedStaticContentContext: Fetched hero content', { id: result.id });
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
      if (useDummyData) {
        return MOCK_ABOUT;
      }
      const { data, error } = await supabaseClient.rpc("get_about_content");
      if (error) {
        console.error("Error fetching about content:", error);
        return null;
      }
      const result = (data as any)?.[0] as
        | Database["public"]["Tables"]["about_content"]["Row"]
        | undefined;
      if (result) {
        console.log('EnhancedStaticContentContext: Fetched about content', { id: result.id });
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
      if (useDummyData) {
        return MOCK_SETTINGS;
      }
      const { data, error } = await supabaseClient.rpc("get_site_settings");
      if (error) {
        console.error("Error fetching site settings:", error);
        return null;
      }
      const result = (data as any)?.[0] as
        | Database["public"]["Tables"]["site_settings"]["Row"]
        | undefined;
      if (result) {
        console.log('EnhancedStaticContentContext: Fetched site settings', { id: result.id });
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

  // ENHANCED: Gallery fetch using new storage-aware function
  const fetchGallery = async (): Promise<GalleryImage[]> => {
    try {
      if (useDummyData) {
        return MOCK_GALLERY;
      }

      // Use the new paginated function from storage service
      const result = await galleryStorageService.getGalleryItems({
        page: 1,
        limit: 100, // Get all for context
        status: 'published'
      });

      return result.data;
    } catch (error) {
      console.error("Error in enhanced fetchGallery:", error);
      // Fallback to original method
      try {
        const { data, error: fallbackError } = await supabaseClient
          .from("gallery_items")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          return [];
        }

        return (data || []).map((row: any) => ({
          id: row.id || "",
          title: row.title || "",
          description: row.description ?? null,
          image_url: row.storage_path
            ? galleryStorageService.getFileUrl(row.storage_path)
            : (row.image_url || ""),
          thumbnail_url: row.thumbnail_url || null,
          category: row.category || "",
          status: row.status || "published",
          tags: row.tags || [],
          display_order: row.display_order ?? null,
          event_id: row.event_id ?? null,
          partner_id: row.partner_id ?? null,
          metadata: row.file_metadata || row.metadata || {},
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
          storage_path: row.storage_path || null,
        }));
      } catch (fallbackError) {
        console.error("Both enhanced and fallback fetch failed:", fallbackError);
        return [];
      }
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
    console.log('EnhancedStaticContentContext: Starting saveHeroContent', {
      timestamp: new Date().toISOString(),
      user: user?.id,
      role
    });
    try {
      setError(null);
      if (!user) {
        console.error('EnhancedStaticContentContext: User not authenticated');
        throw new Error("User not authenticated");
      }
      if (role !== "admin") {
        console.error('EnhancedStaticContentContext: Insufficient permissions', { user: user.id, role });
        throw new Error(`Insufficient permissions. User role: ${role}`);
      }

      const saveData = {
        id: "00000000-0000-0000-0000-000000000001",
        title: content.title,
        subtitle: content.subtitle,
        description: typeof content.description === "string" ? content.description : "",
        stats: typeof content.stats === "string" ? content.stats : (content.stats || {}),
        cta_text: content.cta_text,
        cta_link: content.cta_link,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      };

      console.log('EnhancedStaticContentContext: Attempting to upsert hero content');
      const { error } = await supabaseClient
        .from("hero_content")
        .upsert(saveData);

      if (error) {
        console.error("EnhancedStaticContentContext: Database error during saveHeroContent:", error);
        setError(`Failed to save hero content: ${error.message}`);
        throw error;
      }

      setHero(content);
    } catch (err) {
      console.error("EnhancedStaticContentContext: Error in saveHeroContent:", err);
      setError(
        `Failed to save hero content: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      throw err;
    }
  };

  const saveAboutContent = async (content: AboutContent): Promise<void> => {
    console.log('EnhancedStaticContentContext: Starting saveAboutContent', {
      timestamp: new Date().toISOString(),
      user: user?.id,
      role,
      content: {
        title: content.title,
        featuresCount: Array.isArray(content.features) ? content.features.length : 0,
        storyCount: Array.isArray(content.story) ? content.story.length : 0
      }
    });

    try {
      setError(null);
      if (!user) {
        console.error('EnhancedStaticContentContext: User not authenticated');
        throw new Error("User not authenticated");
      }

      if (role !== "admin") {
        console.error('EnhancedStaticContentContext: Insufficient permissions', { user: user.id, role });
        throw new Error(`Insufficient permissions. User role: ${role}`);
      }

      const saveData = {
        id: "00000000-0000-0000-0000-000000000002",
        title: content.title,
        subtitle: content.subtitle,
        founded_year: content.founded_year,
        story: content.story,
        features: content.features,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      };

      console.log('EnhancedStaticContentContext: Attempting to upsert about content to database');

      const { error } = await supabaseClient
        .from("about_content")
        .upsert(saveData);

      if (error) {
        console.error("EnhancedStaticContentContext: Database error during save:", error);
        setError(`Failed to save about content: ${error.message}`);
        throw error;
      }

      console.log('EnhancedStaticContentContext: Successfully saved about content to database');

      setAbout(content);
    } catch (err) {
      console.error("EnhancedStaticContentContext: Error in saveAboutContent:", err);
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

  // ENHANCED: Add gallery image with storage support
  const addGalleryImage = async (
    item: TablesInsert<"gallery_items">
  ): Promise<GalleryImage> => {
    try {
      setError(null);

      // If item has a storage_path, ensure the file exists
      if (item.storage_path) {
        const exists = await galleryStorageService.fileExists(item.storage_path);
        if (!exists) {
          throw new Error(`Storage file not found: ${item.storage_path}`);
        }

        // Update image_url to use storage URL if not provided
        if (!item.image_url) {
          item.image_url = galleryStorageService.getFileUrl(item.storage_path);
        }
      }

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
        const newImage: GalleryImage = {
          id: data.id || "",
          title: data.title || "",
          description: data.description ?? null,
          image_url: data.storage_path
            ? galleryStorageService.getFileUrl(data.storage_path)
            : (data.image_url || ""),
          thumbnail_url: data.thumbnail_url || null,
          category: data.category || "",
          status: data.status || "published",
          tags: data.tags || [],
          display_order: data.display_order ?? null,
          event_id: data.event_id ?? null,
          partner_id: data.partner_id ?? null,
          metadata: data.file_metadata || data.metadata || {},
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          storage_path: data.storage_path || null,
        };

        setGallery((prev) => [...prev, newImage]);
        return newImage;
      }
      throw new Error("No data returned from insert operation");
    } catch (err) {
      console.error("Error in addGalleryImage:", err);
      setError("Failed to add gallery image");
      throw err;
    }
  };

  // ENHANCED: Update gallery image with storage support
  const updateGalleryImage = async (
    id: string,
    updates: TablesUpdate<"gallery_items">,
    oldImageUrls?: string[] | null
  ): Promise<GalleryImage> => {
    try {
      setError(null);

      // Handle storage path updates
      if (updates.storage_path) {
        const exists = await galleryStorageService.fileExists(updates.storage_path);
        if (!exists) {
          throw new Error(`Storage file not found: ${updates.storage_path}`);
        }

        // Update image_url to use storage URL
        if (!updates.image_url) {
          updates.image_url = galleryStorageService.getFileUrl(updates.storage_path);
        }
      }

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

      // Cleanup old files if needed
      if (oldImageUrls && oldImageUrls.length > 0) {
        await cleanupGalleryAsset(oldImageUrls);
      }

      if (data) {
        const updatedImage: GalleryImage = {
          id: data.id || "",
          title: data.title || "",
          description: data.description ?? null,
          image_url: data.storage_path
            ? galleryStorageService.getFileUrl(data.storage_path)
            : (data.image_url || ""),
          thumbnail_url: data.thumbnail_url || null,
          category: data.category || "",
          status: data.status || "published",
          tags: data.tags || [],
          display_order: data.display_order ?? null,
          event_id: data.event_id ?? null,
          partner_id: data.partner_id ?? null,
          metadata: data.file_metadata || data.metadata || {},
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          storage_path: data.storage_path || null,
        };

        setGallery((prev) =>
          prev.map((image) => image.id === id ? updatedImage : image)
        );

        return updatedImage;
      }
      throw new Error("No data returned from update operation");
    } catch (err) {
      console.error("Error in updateGalleryImage:", err);
      setError("Failed to update gallery image");
      throw err;
    }
  };

  // ENHANCED: Delete gallery image with storage cleanup
  const deleteGalleryImage = async (id: string): Promise<void> => {
    try {
      setError(null);
      const itemToDelete = gallery.find((item) => item.id === id);

      // Get storage path from storage_path property
      const storagePath = itemToDelete?.storage_path || undefined;

      // Delete from database first
      const { error } = await supabaseClient
        .from("gallery_items")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting gallery item:", error);
        setError(`Failed to delete gallery item: ${error.message}`);
        throw error;
      }

      // Delete from storage if path exists
      if (storagePath) {
        try {
          await galleryStorageService.deleteStorageFile(storagePath);
        } catch (storageError) {
          console.warn("Failed to delete storage file:", storageError);
          // Continue even if storage deletion fails
        }
      }

      // Cleanup old URLs if any
      if (itemToDelete?.image_url) {
        await cleanupGalleryAsset([itemToDelete.image_url]);
      }

      setGallery((prev) => prev.filter((image) => image.id !== id));
    } catch (err) {
      console.error("Error in deleteGalleryImage:", err);
      setError("Failed to delete gallery item");
      throw err;
    }
  };

  // NEW: Upload files using new storage system
  const uploadGalleryFiles = async (files: File[]) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const results = await galleryStorageService.uploadMultipleFiles(files, user.id, {
      optimize: true,
      generateThumbnail: true,
    });

    // Refresh gallery after upload
    if (results.some(r => r.success)) {
      await refreshStaticContent();
    }

    return results;
  };

  // NEW: Get storage statistics
  const getStorageStats = async () => {
    return await galleryStorageService.getStorageStats();
  };

  // NEW: Check storage consistency
  const checkStorageConsistency = async () => {
    return await galleryStorageService.checkConsistency();
  };

  // NEW: Cleanup orphaned files
  const cleanupOrphanedFiles = async () => {
    return await galleryStorageService.cleanupOrphanedFiles();
  };

  // NEW: Get paginated gallery items
  const getGalleryItemsPaginated = async (page = 1, limit = 20, filters?: any) => {
    return await galleryStorageService.getGalleryItems({
      page,
      limit,
      ...filters
    });
  };

  const getSectionContent = (sectionSlug: string): SectionContent | null => {
    return sectionContent[sectionSlug] || null;
  };

  const getSectionPermissions = (sectionSlug: string): SectionPermissions => {
    const section = adminSections.find((s) => s.slug === sectionSlug);
    return {
      canView: !!section,
      canEdit: !!section && section.slug === "settings" ? role === "admin" : !!section,
      canPublish: !!section && role === "admin",
      canDelete: !!section && role === "admin",
    };
  };

  const updateSectionContent = async (
    sectionSlug: string,
    content: Json
  ): Promise<void> => {
    try {
      setError(null);
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabaseClient.rpc("update_section_content", {
        p_section_slug: sectionSlug,
        p_user_id: user.id,
        p_payload: content,
      });

      if (error) {
        console.error("Error updating section content:", error);
        setError(`Failed to update section content: ${error.message}`);
        throw error;
      }

      setSectionContent((prev) => ({
        ...prev,
        [sectionSlug]: {
          id: prev[sectionSlug]?.id || "",
          section_id: sectionSlug,
          section_slug: sectionSlug,
          payload: content,
          version: (prev[sectionSlug]?.version || 0) + 1,
          is_active: true,
          created_at: prev[sectionSlug]?.created_at || new Date().toISOString(),
          created_by: prev[sectionSlug]?.created_by || user.id,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
      }));
    } catch (err) {
      console.error("Error in updateSectionContent:", err);
      setError("Failed to update section content");
      throw err;
    }
  };

  const refreshStaticContent = async (): Promise<void> => {
    await loadStaticContent();
  };

  const value: EnhancedStaticContentContextType = {
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
    refreshStaticContent,

    // New enhanced functions
    uploadGalleryFiles,
    getStorageStats,
    checkStorageConsistency,
    cleanupOrphanedFiles,
    getGalleryItemsPaginated,
  };

  return (
    <EnhancedStaticContentContext.Provider value={value}>
      {children}
    </EnhancedStaticContentContext.Provider>
  );
};

export const useEnhancedStaticContent = () => {
  const context = useContext(EnhancedStaticContentContext);
  if (!context) {
    throw new Error(
      "useEnhancedStaticContent must be used within EnhancedStaticContentProvider"
    );
  }
  return context;
};