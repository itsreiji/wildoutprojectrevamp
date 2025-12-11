'use client';

import { createContext, useContext } from 'react';

import type {
  TeamMember,
  Partner,
  HeroContent,
  AboutContent,
  GalleryImage,
  SiteSettings,
  AdminSection,
  SectionContent,
  SectionPermissions,
  LandingEvent,
  EventArtist,
} from '../types/content';
import { TablesInsert, TablesUpdate } from '../types/supabase';

export interface ContentContextType {
  events: LandingEvent[];
  partners: Partner[];
  gallery: GalleryImage[];
  team: TeamMember[];
  hero: HeroContent;
  about: AboutContent;
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  addEvent: (event: TablesInsert<'events'>) => Promise<LandingEvent>;
  updateEvent: (id: string, updates: TablesUpdate<'events'>) => Promise<LandingEvent>;
  deleteEvent: (id: string) => Promise<void>;
  addTeamMember: (member: TablesInsert<'team_members'>) => Promise<TeamMember>;
  updateTeamMember: (id: string, updates: TablesUpdate<'team_members'>) => Promise<TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;
  addPartner: (partner: TablesInsert<'partners'>) => Promise<Partner>;
  updatePartner: (id: string, updates: TablesUpdate<'partners'>) => Promise<Partner>;
  deletePartner: (id: string) => Promise<void>;
  addGalleryImage: (image: TablesInsert<'gallery_items'>) => Promise<GalleryImage>;
  updateGalleryImage: (id: string, updates: TablesUpdate<'gallery_items'>) => Promise<GalleryImage>;
  deleteGalleryImage: (id: string) => Promise<void>;
  fetchEventArtists: (eventId: string) => Promise<EventArtist[]>;
  addEventArtist: (artist: Omit<EventArtist, 'id' | 'created_at' | 'updated_at'>) => Promise<EventArtist>;
  updateEventArtist: (id: string, updates: Partial<Omit<EventArtist, 'id' | 'created_at' | 'updated_at'>>) => Promise<EventArtist>;
  deleteEventArtist: (id: string) => Promise<void>;
  saveHeroContent: (content: HeroContent) => Promise<HeroContent>;
  saveAboutContent: (content: AboutContent) => Promise<AboutContent>;
  saveSiteSettings: (settings: SiteSettings) => Promise<SiteSettings>;
  adminSections: AdminSection[];
  sectionContent: Record<string, SectionContent>;
  adminSectionsLoading: boolean;
  getSectionContent: (sectionId: string) => SectionContent | null;
  getSectionPermissions: () => SectionPermissions[];
  updateSectionContent: (sectionId: string, content: SectionContent) => Promise<SectionContent>;
}

export const ContentContext = createContext<ContentContextType | null>(null);

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be within ContentProvider');
  return context;
}
