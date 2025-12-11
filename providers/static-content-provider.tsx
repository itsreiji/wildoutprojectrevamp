'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { supabaseClient } from '../lib/supabase/client';
import type { HeroContent, AboutContent, SiteSettings } from '../types/content';
import type { Json } from '../types/supabase';

import { useAuth } from './auth-provider';


// Helper functions for data normalization
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
    {},
  );
};

const ensureStringArray = (value: Json | undefined): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return undefined;
};

interface StaticContentContextType {
  hero: HeroContent | null;
  about: AboutContent | null;
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  saveHeroContent: (content: HeroContent) => Promise<any>;
  saveAboutContent: (content: AboutContent) => Promise<any>;
  saveSiteSettings: (settings: SiteSettings) => Promise<any>;
}

const StaticContentContext = createContext<StaticContentContextType | null>(null);

export const StaticContentProvider = ({ children }: { children: ReactNode }) => {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch hero content from Supabase
  const fetchHeroContent = async (): Promise<HeroContent> => {
    try {
      const { data, error } = await supabaseClient.rpc('get_hero_content');
      if (error) {
        console.error('Error fetching hero content:', error);
        // Return default hero content if fetching fails
        return {
          id: '00000000-0000-0000-0000-000000000001',
          title: 'WildOut!',
          subtitle: 'Media Digital Nightlife & Event Multi-Platform',
          description: "Indonesia's premier creative community connecting artists, events, and experiences.",
          stats: { events: '500+', members: '50K+', partners: '100+' },
          cta_text: 'Join Us',
          cta_link: '/events',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: null,
        };
      }
      const result = data?.[0];
      if (result) {
        return {
          id: result.id ?? '00000000-0000-0000-0000-000000000001',
          title: result.title ?? 'WildOut!',
          subtitle: result.subtitle ?? 'Media Digital Nightlife & Event Multi-Platform',
          description: result.description ?? "Indonesia's premier creative community connecting artists, events, and experiences.",
          stats: typeof result.stats === 'string' ? JSON.parse(result.stats) ?? { events: '500+', members: '50K+', partners: '100+' } : (result.stats ?? { events: '500+', members: '50K+', partners: '100+' }),
          cta_text: result.cta_text ?? 'Join Us',
          cta_link: result.cta_link ?? '/events',
          created_at: result.created_at ?? new Date().toISOString(),
          updated_at: result.updated_at ?? new Date().toISOString(),
          updated_by: result.updated_by ?? null,
        };
      }
      // Return default hero content if no data returned
      return {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'WildOut!',
        subtitle: 'Media Digital Nightlife & Event Multi-Platform',
        description: "Indonesia's premier creative community connecting artists, events, and experiences.",
        stats: { events: '500+', members: '50K+', partners: '100+' },
        cta_text: 'Join Us',
        cta_link: '/events',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: null,
      };
    } catch (error) {
      console.error('Error in fetchHeroContent:', error);
      return {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'WildOut!',
        subtitle: 'Media Digital Nightlife & Event Multi-Platform',
        description: "Indonesia's premier creative community connecting artists, events, and experiences.",
        stats: { events: '500+', members: '50K+', partners: '100+' },
        cta_text: 'Join Us',
        cta_link: '/events',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: null,
      };
    }
  };

  // Fetch about content from Supabase
  const fetchAboutContent = async (): Promise<AboutContent> => {
    try {
      const { data, error } = await supabaseClient.rpc('get_about_content');
      if (error) {
        console.error('Error fetching about content:', error);
        return {
          id: '00000000-0000-0000-0000-000000000002',
          title: 'About WildOut!',
          subtitle: "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020.",
          founded_year: '2020',
          story: [
            'Founded in 2020, WildOut! celebrates Indonesia’s creative culture.',
            'We host community-driven events that bring artists, venues, and sponsors together.',
          ],
          features: [
            { title: 'Community First', description: 'We build lasting connections.' },
            { title: 'Unforgettable Experiences', description: 'Every event is crafted to be memorable.' },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: null,
        };
      }
      const result = data?.[0];
      if (result) {
        return {
          id: result.id ?? '00000000-0000-0000-0000-000000000002',
          title: result.title ?? 'About WildOut!',
          subtitle: result.subtitle ?? "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020.",
          founded_year: result.founded_year ?? '2020',
          story: ensureStringArray(result.story) ?? [
            'Founded in 2020, WildOut! celebrates Indonesia’s creative culture.',
            'We host community-driven events that bring artists, venues, and sponsors together.',
          ],
          features: typeof result.features === 'string'
            ? JSON.parse(result.features) ?? [
                { title: 'Community First', description: 'We build lasting connections.' },
                { title: 'Unforgettable Experiences', description: 'Every event is crafted to be memorable.' },
              ]
            : (result.features ?? [
                { title: 'Community First', description: 'We build lasting connections.' },
                { title: 'Unforgettable Experiences', description: 'Every event is crafted to be memorable.' },
              ]),
          created_at: result.created_at ?? new Date().toISOString(),
          updated_at: result.updated_at ?? new Date().toISOString(),
          updated_by: result.updated_by ?? null,
        };
      }
      return {
        id: '00000000-0000-0000-0000-000000000002',
        title: 'About WildOut!',
        subtitle: "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020.",
        founded_year: '2020',
        story: [
          'Founded in 2020, WildOut! celebrates Indonesia’s creative culture.',
          'We host community-driven events that bring artists, venues, and sponsors together.',
        ],
        features: [
          { title: 'Community First', description: 'We build lasting connections.' },
          { title: 'Unforgettable Experiences', description: 'Every event is crafted to be memorable.' },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: null,
      };
    } catch (error) {
      console.error('Error in fetchAboutContent:', error);
      return {
        id: '00000000-0000-0000-0000-000000000002',
        title: 'About WildOut!',
        subtitle: "Indonesia's leading creative community platform, connecting artists, events, and experiences since 2020.",
        founded_year: '2020',
        story: [
          'Founded in 2020, WildOut! celebrates Indonesia’s creative culture.',
          'We host community-driven events that bring artists, venues, and sponsors together.',
        ],
        features: [
          { title: 'Community First', description: 'We build lasting connections.' },
          { title: 'Unforgettable Experiences', description: 'Every event is crafted to be memorable.' },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: null,
      };
    }
  };

  // Fetch site settings from Supabase
  const fetchSiteSettings = async (): Promise<SiteSettings> => {
    try {
      const { data, error } = await supabaseClient.rpc('get_site_settings');
      if (error) {
        console.error('Error fetching site settings:', error);
        return {
          id: '00000000-0000-0000-0000-000000000003',
          site_name: 'WildOut!',
          site_description: "Indonesia's premier creative community platform",
          tagline: "Indonesia's premier creative community platform",
          email: 'contact@wildout.id',
          phone: '+62 21 1234 567',
          address: 'Jakarta, Indonesia',
          social_media: {
            instagram: 'https://instagram.com/wildout.id',
            twitter: 'https://twitter.com/wildout_id',
            facebook: 'https://facebook.com/wildout.id',
            youtube: 'https://youtube.com/@wildout',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: null,
        };
      }
      const result = data?.[0];
      if (result) {
        return {
          id: result.id ?? '00000000-0000-0000-0000-000000000003',
          site_name: result.site_name ?? 'WildOut!',
          site_description: result.site_description ?? "Indonesia's premier creative community platform",
          tagline: result.tagline ?? "Indonesia's premier creative community platform",
          email: result.email ?? 'contact@wildout.id',
          phone: result.phone ?? '+62 21 1234 567',
          address: result.address ?? 'Jakarta, Indonesia',
          social_media: normalizeSocialLinks(result.social_media) as Record<string, string>,
          created_at: result.created_at ?? new Date().toISOString(),
          updated_at: result.updated_at ?? new Date().toISOString(),
          updated_by: result.updated_by ?? null,
        };
      }
      return {
        id: '00000000-0000-0000-0000-000000000003',
        site_name: 'WildOut!',
        site_description: "Indonesia's premier creative community platform",
        tagline: "Indonesia's premier creative community platform",
        email: 'contact@wildout.id',
        phone: '+62 21 1234 567',
        address: 'Jakarta, Indonesia',
        social_media: {
          instagram: 'https://instagram.com/wildout.id',
          twitter: 'https://twitter.com/wildout_id',
          facebook: 'https://facebook.com/wildout.id',
          youtube: 'https://youtube.com/@wildout',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: null,
      };
    } catch (error) {
      console.error('Error in fetchSiteSettings:', error);
      return {
        id: '00000000-0000-0000-0000-000000000003',
        site_name: 'WildOut!',
        site_description: "Indonesia's premier creative community platform",
        tagline: "Indonesia's premier creative community platform",
        email: 'contact@wildout.id',
        phone: '+62 21 1234 567',
        address: 'Jakarta, Indonesia',
        social_media: {
          instagram: 'https://instagram.com/wildout.id',
          twitter: 'https://twitter.com/wildout_id',
          facebook: 'https://facebook.com/wildout.id',
          youtube: 'https://youtube.com/@wildout',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: null,
      };
    }
  };

  // Save hero content to Supabase
  const saveHeroContent = async (content: HeroContent) => {
    try {
      const { data, error } = await supabaseClient
        .from('hero_content')
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
      console.error('Error saving hero content:', err);
      setError('Failed to save hero content');
      throw err;
    }
  };

  // Save about content to Supabase
  const saveAboutContent = async (content: AboutContent) => {
    try {
      const { data, error } = await supabaseClient
        .from('about_content')
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
      console.error('Error saving about content:', err);
      setError('Failed to save about content');
      throw err;
    }
  };

  // Save site settings to Supabase
  const saveSiteSettings = async (settings: SiteSettings) => {
    try {
      const { data, error } = await supabaseClient
        .from('site_settings')
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
      console.error('Error saving site settings:', err);
      setError('Failed to save site settings');
      throw err;
    }
  };

  // Load static content on initial render if user is authenticated
  useEffect(() => {
    if (user) {
      const loadStaticContent = async () => {
        setLoading(true);
        try {
          const [heroData, aboutData, settingsData] = await Promise.all([
            fetchHeroContent(),
            fetchAboutContent(),
            fetchSiteSettings(),
          ]);

          setHero(heroData);
          setAbout(aboutData);
          setSettings(settingsData);
        } catch (err) {
          console.error('Error loading static content:', err);
          setError('Failed to load static content');
        } finally {
          setLoading(false);
        }
      };

      loadStaticContent();
    } else {
      setHero(null);
      setAbout(null);
      setSettings(null);
      setLoading(false);
    }
  }, [user]);

  const value = React.useMemo(() => ({
    hero,
    about,
    settings,
    loading,
    error,
    saveHeroContent,
    saveAboutContent,
    saveSiteSettings,
  }), [hero, about, settings, loading, error]);

  return <StaticContentContext.Provider value={value}>{children}</StaticContentContext.Provider>;
}

export function useStaticContent() {
  const context = useContext(StaticContentContext);
  if (!context) {
    throw new Error('useStaticContent must be used within a StaticContentProvider');
  }
  return context;
}
