import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabaseClient } from '../supabase/client';
import { useAuth } from './AuthContext';
import type { AuthRole } from './AuthContext';
import type { TablesInsert, TablesUpdate, Json } from '../supabase/types';
import { DUMMY_GALLERY_ITEMS } from '../data/dummyData';
import { cleanupGalleryAsset } from '../utils/storageHelpers';
import type {
  HeroContent,
  AboutContent,
  GalleryImage,
  SiteSettings,
  AdminSection,
  SectionContent,
  SectionPermissions
} from '@/types/content';

// Initial data
const INITIAL_HERO: HeroContent = {
  title: 'WildOut!',
  subtitle: 'Media Digital Nightlife & Event Multi-Platform',
  description: "Indonesia's premier creative community connecting artists, events, and experiences.",
  stats: { events: '500+', members: '50K+', partners: '100+' },
};
const INITIAL_ABOUT: AboutContent = {
  title: 'About WildOut!',
  subtitle: "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020.",
  foundedYear: '2020',
  story: [
    'Founded in 2020, WildOut! celebrates Indonesia’s creative culture.',
    'We host community-driven events that bring artists, venues, and sponsors together.',
  ],
  features: [
    { title: 'Community First', description: 'We build lasting connections.' },
    { title: 'Unforgettable Experiences', description: 'Every event is crafted to be memorable.' },
  ],
};
const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'WildOut!',
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
const INITIAL_GALLERY: GalleryImage[] = [];

const ensureStringArray = (value: Json | undefined): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return undefined;
};

const normalizeSocialLinks = (value: Json | undefined): Record<string, string | null> => {
  if (!value || typeof value === 'string') return {};
  if (Array.isArray(value)) return {};
  return Object.entries(value as Record<string, Json | undefined>).reduce<Record<string, string | null>>(
    (acc, [key, entry]) => {
      if (typeof entry === 'string') {
        acc[key] = entry;
      } else if (typeof entry === 'number' || typeof entry === 'boolean') {
        acc[key] = String(entry);
      } else if (entry === null || entry === undefined) {
        acc[key] = null;
      }
      return acc;
    },
    {}
  );
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
  useDummyData: boolean;
  setUseDummyData: React.Dispatch<React.SetStateAction<boolean>>;
  updateHero: React.Dispatch<React.SetStateAction<HeroContent>>;
  updateAbout: React.Dispatch<React.SetStateAction<AboutContent>>;
  updateSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  updateGallery: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
  saveHeroContent: (content: HeroContent) => Promise<void>;
  saveAboutContent: (content: AboutContent) => Promise<void>;
  saveSiteSettings: (settings: SiteSettings) => Promise<void>;
  addGalleryImage: (item: TablesInsert<'gallery_items'>) => Promise<GalleryImage>;
  updateGalleryImage: (id: string, updates: TablesUpdate<'gallery_items'>, oldImageUrls?: string[] | null) => Promise<GalleryImage>;
  deleteGalleryImage: (id: string) => Promise<void>;
  getSectionContent: (sectionSlug: string) => SectionContent | null;
  getSectionPermissions: (sectionSlug: string) => SectionPermissions;
  updateSectionContent: (sectionSlug: string, content: Json) => Promise<void>;
  refreshStaticContent: () => Promise<void>;
}

const StaticContentContext = createContext<StaticContentContextType | undefined>(undefined);

export const StaticContentProvider: React.FC<{ children: ReactNode; useDummyData?: boolean }> = ({ 
  children, 
  useDummyData: initialUseDummyData = false 
}) => {
  const authContext = useAuth();
  const user = authContext.user;
  const role: AuthRole = authContext.role;

  const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
  const [about, setAbout] = useState<AboutContent>(INITIAL_ABOUT);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
  const [adminSections, setAdminSections] = useState<AdminSection[]>([]);
  const [sectionContent, setSectionContent] = useState<Record<string, SectionContent>>({});
  const [loading, setLoading] = useState(true);
  const [adminSectionsLoading, setAdminSectionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDummyData, setUseDummyData] = useState<boolean>(initialUseDummyData);

  const fetchHeroContent = async (): Promise<HeroContent> => {
    try {
      const { data, error } = await supabaseClient.rpc('get_hero_content');
      if (error) {
        console.error('Error fetching hero content:', error);
        return INITIAL_HERO;
      }
      const result = data?.[0];
      if (result) {
        return {
          title: result.title ?? INITIAL_HERO.title,
          subtitle: result.subtitle ?? INITIAL_HERO.subtitle,
          description: result.description ?? INITIAL_HERO.description,
          stats: typeof result.stats === 'string' ? JSON.parse(result.stats) ?? INITIAL_HERO.stats : (result.stats ?? INITIAL_HERO.stats),
          ctaText: result.cta_text ?? INITIAL_HERO.ctaText,
          ctaLink: result.cta_link ?? INITIAL_HERO.ctaLink,
        };
      }
      return INITIAL_HERO;
    } catch (error) {
      console.error('Error in fetchHeroContent:', error);
      return INITIAL_HERO;
    }
  };

  const fetchAboutContent = async (): Promise<AboutContent> => {
    try {
      const { data, error } = await supabaseClient.rpc('get_about_content');
      if (error) {
        console.error('Error fetching about content:', error);
        return INITIAL_ABOUT;
      }
      const result = data?.[0];
      if (result) {
        return {
          title: result.title ?? INITIAL_ABOUT.title,
          subtitle: result.subtitle ?? INITIAL_ABOUT.subtitle,
          foundedYear: result.founded_year ?? INITIAL_ABOUT.foundedYear,
          story: ensureStringArray(result.story) ?? INITIAL_ABOUT.story,
          features: typeof result.features === 'string' ? JSON.parse(result.features) ?? INITIAL_ABOUT.features : (result.features ?? INITIAL_ABOUT.features),
        };
      }
      return INITIAL_ABOUT;
    } catch (error) {
      console.error('Error in fetchAboutContent:', error);
      return INITIAL_ABOUT;
    }
  };

  const fetchSiteSettings = async (): Promise<SiteSettings> => {
    try {
      const { data, error } = await supabaseClient.rpc('get_site_settings');
      if (error) {
        console.error('Error fetching site settings:', error);
        return INITIAL_SETTINGS;
      }
      const result = data?.[0];
      if (result) {
        return {
          siteName: result.site_name ?? INITIAL_SETTINGS.siteName,
          siteDescription: result.site_description ?? INITIAL_SETTINGS.siteDescription,
          tagline: result.tagline ?? INITIAL_SETTINGS.tagline,
          email: result.email ?? INITIAL_SETTINGS.email,
          phone: result.phone ?? INITIAL_SETTINGS.phone,
          address: result.address ?? INITIAL_SETTINGS.address,
          socialMedia: normalizeSocialLinks(result.social_media) as Record<string, string>,
        };
      }
      return INITIAL_SETTINGS;
    } catch (error) {
      console.error('Error in fetchSiteSettings:', error);
      return INITIAL_SETTINGS;
    }
  };

  const fetchGallery = async (): Promise<GalleryImage[]> => {
    try {
      const { data, error } = await supabaseClient
        .from('gallery_items')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching gallery:', error);
        return INITIAL_GALLERY;
      }
      return (data || []).map((row: any): GalleryImage => ({
        id: row.id,
        title: row.title || undefined,
        description: row.description || undefined,
        url: row.image_url || undefined,
        image_urls: row.image_urls ? JSON.parse(row.image_urls) as string[] : undefined,
        category: row.category || undefined,
        status: row.status || undefined,
        tags: row.tags || undefined,
        caption: row.title || undefined,
        uploadDate: row.created_at || undefined,
        event: row.event_title || undefined,
        created_at: row.created_at || undefined,
        updated_at: row.updated_at || undefined,
      }));
    } catch (error) {
      console.error('Error in fetchGallery:', error);
      return INITIAL_GALLERY;
    }
  };

  const loadStaticContent = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useDummyData) {
        setHero(INITIAL_HERO);
        setAbout(INITIAL_ABOUT);
        setSettings(INITIAL_SETTINGS);
        setGallery(
            DUMMY_GALLERY_ITEMS.map(g => {
              const imageUrls = ensureStringArray(g.image_urls) ?? [];
              return {
                id: g.id || `gallery-${Date.now()}-${Math.random()}`,
                title: g.title,
                description: g.description ?? null,
                category: g.category ?? null,
                status: g.status ?? 'published',
                tags: Array.isArray(g.tags) ? g.tags.filter((tag): tag is string => typeof tag === 'string') : [],
                image_urls: imageUrls,
                url: imageUrls[0] || '',
                created_at: g.created_at ?? new Date().toISOString(),
                updated_at: g.updated_at ?? new Date().toISOString(),
              };
            })
          );
      } else {
        const [heroData, aboutData, settingsData, galleryData] = await Promise.all([
          fetchHeroContent(),
          fetchAboutContent(),
          fetchSiteSettings(),
          fetchGallery()
        ]);
        setHero(heroData);
        setAbout(aboutData);
        setSettings(settingsData);
        setGallery(galleryData);
      }
    } catch (err) {
      console.error('Error loading static content:', err);
      setError('Failed to load static content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaticContent();
  }, [useDummyData]);

  // Load admin sections
  useEffect(() => {
    const loadAdminSections = async () => {
      try {
        setAdminSectionsLoading(true);
        const { data: sections, error: sectionsError } = await supabaseClient
          .rpc('get_admin_sections_for_user', { user_id: user?.id });

        if (sectionsError) {
          console.error('Error fetching admin sections:', sectionsError);
          // Fallback to hardcoded sections
          setAdminSections([
            {
              id: 'home-id',
              slug: 'home',
              label: 'Dashboard',
              icon: 'LayoutDashboard',
              category: 'main',
              order_index: 1,
              enabled: true,
              description: 'Overview dashboard with statistics and recent activity',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'hero-id',
              slug: 'hero',
              label: 'Hero Section',
              icon: 'Sparkles',
              category: 'content',
              order_index: 2,
              enabled: true,
              description: 'Landing page hero section with title, subtitle, and call-to-action',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'about-id',
              slug: 'about',
              label: 'About Us',
              icon: 'Info',
              category: 'content',
              order_index: 3,
              enabled: true,
              description: 'About page content including story and features',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'events-id',
              slug: 'events',
              label: 'Events',
              icon: 'Calendar',
              category: 'content',
              order_index: 4,
              enabled: true,
              description: 'Manage events, categories, and event details',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'team-id',
              slug: 'team',
              label: 'Team',
              icon: 'Users',
              category: 'content',
              order_index: 5,
              enabled: true,
              description: 'Team members and their information',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'gallery-id',
              slug: 'gallery',
              label: 'Gallery',
              icon: 'Image',
              category: 'content',
              order_index: 6,
              enabled: true,
              description: 'Image gallery items and management',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'partners-id',
              slug: 'partners',
              label: 'Partners',
              icon: 'Handshake',
              category: 'content',
              order_index: 7,
              enabled: true,
              description: 'Partner organizations and collaborations',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            },
            {
              id: 'settings-id',
              slug: 'settings',
              label: 'Settings',
              icon: 'Settings',
              category: 'management',
              order_index: 8,
              enabled: true,
              description: 'Site-wide settings and configuration',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: null,
              updated_by: null
            }
          ]);
        } else {
          setAdminSections(sections || []);
        }

        const contentMap: Record<string, SectionContent> = {};
        const sectionsWithContent = ['home', 'events', 'team', 'gallery', 'partners', 'settings'];

        for (const sectionSlug of sectionsWithContent) {
          try {
            const { data: content, error: contentError } = await supabaseClient
              .rpc('get_section_content', { section_slug: sectionSlug, user_id: user?.id });

            if (!contentError && content && content.length > 0) {
              contentMap[sectionSlug] = content[0];
            }
          } catch (err) {
            console.warn(`Failed to fetch content for section ${sectionSlug}:`, err);
          }
        }
        setSectionContent(contentMap);
      } catch (error) {
        console.error('Error loading admin sections:', error);
      } finally {
        setAdminSectionsLoading(false);
      }
    };

    loadAdminSections();
  }, [user?.id]);

  const saveHeroContent = async (content: HeroContent): Promise<void> => {
    try {
      setError(null);
      if (!user) throw new Error('User not authenticated');
      if (role !== 'admin') throw new Error(`Insufficient permissions. User role: ${role}`);

      const saveData = {
        id: '00000000-0000-0000-0000-000000000001',
        title: content.title,
        subtitle: content.subtitle,
        description: content.description,
        stats: content.stats,
        cta_text: content.ctaText,
        cta_link: content.ctaLink,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('hero_content')
        .upsert(saveData);

      if (error) {
        console.error('Database error:', error);
        setError(`Failed to save hero content: ${error.message}`);
        throw error;
      }

      setHero(content);
    } catch (err) {
      console.error('Error in saveHeroContent:', err);
      setError(`Failed to save hero content: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const saveAboutContent = async (content: AboutContent): Promise<void> => {
    try {
      setError(null);
      if (!user) throw new Error('User not authenticated');
      if (role !== 'admin') throw new Error(`Insufficient permissions. User role: ${role}`);

      const saveData = {
        id: '00000000-0000-0000-0000-000000000002',
        title: content.title,
        subtitle: content.subtitle,
        founded_year: content.foundedYear,
        story: content.story,
        features: content.features,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('about_content')
        .upsert(saveData);

      if (error) {
        console.error('Database error:', error);
        setError(`Failed to save about content: ${error.message}`);
        throw error;
      }

      setAbout(content);
    } catch (err) {
      console.error('Error in saveAboutContent:', err);
      setError(`Failed to save about content: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
    try {
      setError(null);
      if (!user) throw new Error('User not authenticated');
      if (role !== 'admin') throw new Error(`Insufficient permissions. User role: ${role}`);

      const saveData = {
        id: '00000000-0000-0000-0000-000000000003',
        site_name: settings.siteName,
        site_description: settings.siteDescription,
        tagline: settings.tagline,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        social_media: settings.socialMedia,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('site_settings')
        .upsert(saveData);

      if (error) {
        console.error('Database error:', error);
        setError(`Failed to save site settings: ${error.message}`);
        throw error;
      }

      setSettings(settings);
    } catch (err) {
      console.error('Error in saveSiteSettings:', err);
      setError(`Failed to save site settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const addGalleryImage = async (item: TablesInsert<'gallery_items'>): Promise<GalleryImage> => {
    try {
      setError(null);
      const { data, error } = await supabaseClient
        .from('gallery_items')
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error('Error adding gallery image:', error);
        setError(`Failed to add gallery image: ${error.message}`);
        throw error;
      }

      if (data) {
        setGallery(prev => [...prev, data]);
        return data;
      }
      throw new Error('No data returned from insert operation');
    } catch (err) {
      console.error('Error in addGalleryImage:', err);
      setError('Failed to add gallery image');
      throw err;
    }
  };

  const updateGalleryImage = async (id: string, updates: TablesUpdate<'gallery_items'>, oldImageUrls?: string[] | null): Promise<GalleryImage> => {
    try {
      setError(null);
      const { data, error } = await supabaseClient
        .from('gallery_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating gallery image:', error);
        setError(`Failed to update gallery image: ${error.message}`);
        throw error;
      }

      if (oldImageUrls && updates.image_urls) {
        const oldUrls = Array.isArray(oldImageUrls) ? oldImageUrls : [];
        const newUrls = Array.isArray(updates.image_urls) ? updates.image_urls : [];
        const urlsToCleanup = oldUrls.filter((url: string) => !newUrls.includes(url));
        if (urlsToCleanup.length > 0) {
          await cleanupGalleryAsset(urlsToCleanup);
        }
      }

      if (data) {
        setGallery(prev => prev.map(image => image.id === id ? data : image));
        return data;
      }
      throw new Error('No data returned from update operation');
    } catch (err) {
      console.error('Error in updateGalleryImage:', err);
      setError('Failed to update gallery image');
      throw err;
    }
  };

  const deleteGalleryImage = async (id: string): Promise<void> => {
    try {
      setError(null);
      const itemToDelete = gallery.find(item => item.id === id);
      const { error } = await supabaseClient
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting gallery item:', error);
        setError(`Failed to delete gallery item: ${error.message}`);
        throw error;
      }

      if (itemToDelete?.image_urls && Array.isArray(itemToDelete.image_urls)) {
        await cleanupGalleryAsset(itemToDelete.image_urls as string[]);
      }

      setGallery(prev => prev.filter(image => image.id !== id));
    } catch (err) {
      console.error('Error in deleteGalleryImage:', err);
      setError('Failed to delete gallery item');
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

  const updateSectionContent = async (sectionSlug: string, content: any): Promise<void> => {
    try {
      setError(null);
      const { data, error } = await supabaseClient
        .rpc('update_section_content', {
          section_slug: sectionSlug,
          new_payload: content
        });

      if (error) {
        console.error('Error updating section content:', error);
        setError(`Failed to update section content: ${error.message}`);
        throw error;
      }

      setSectionContent(prev => ({
        ...prev,
        [sectionSlug]: {
          ...prev[sectionSlug],
          payload: content,
          updated_at: new Date().toISOString()
        }
      }));
    } catch (err) {
      console.error('Error in updateSectionContent:', err);
      setError('Failed to update section content');
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
    useDummyData,
    setUseDummyData,
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
    refreshStaticContent: loadStaticContent
  };

  return <StaticContentContext.Provider value={value}>{children}</StaticContentContext.Provider>;
};

export const useStaticContent = () => {
  const context = useContext(StaticContentContext);
  if (!context) throw new Error('useStaticContent must be used within StaticContentProvider');
  return context;
};