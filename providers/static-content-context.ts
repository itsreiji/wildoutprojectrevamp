'use client';

import { createContext, useContext } from 'react';

import type { HeroContent, AboutContent, SiteSettings } from '../types/content';
import type { TablesInsert } from '../types/supabase';

export interface StaticContentContextType {
  hero: HeroContent | null;
  about: AboutContent | null;
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  saveHeroContent: (content: TablesInsert<'hero_content'>) => Promise<HeroContent>;
  saveAboutContent: (content: TablesInsert<'about_content'>) => Promise<AboutContent>;
  saveSiteSettings: (settings: TablesInsert<'site_settings'>) => Promise<SiteSettings>;
}

export const StaticContentContext = createContext<StaticContentContextType | null>(null);

export function useStaticContent() {
  const context = useContext(StaticContentContext);
  if (!context) {
    throw new Error('useStaticContent must be used within a StaticContentProvider');
  }
  return context;
}
