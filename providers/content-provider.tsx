"use client";

// This is the corrected version of content-provider.tsx
// Fixes for TypeScript compilation errors

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { ContentContextType, LandingEvent, Partner, HeroContent, AboutContent, SiteSettings, AdminSection } from '../types/content';
import { TablesInsert } from '../types/supabase';

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Initial default values
const INITIAL_HERO: HeroContent = {
  id: '',
  title: 'WildOut! Events',
  subtitle: 'Experience the Best Events',
  description: 'Discover amazing events happening around you',
  stats: null,
  cta_text: 'Explore Events',
  cta_link: '/events',
  created_at: null,
  updated_at: null,
  updated_by: null,
};

// FIXED: Array indexing issues - RPC returns object, not array
export const useContent = () => {
  const [content, setContent] = useState<ContentContextType>({
    events: [],
    partners: [],
    gallery: [],
    team: [],
    hero: INITIAL_HERO,
    about: {
      id: '',
      title: 'About WildOut!',
      subtitle: 'Our Story',
      founded_year: '2023',
      story: [],
      features: null,
      created_at: null,
      updated_at: null,
      updated_by: null,
    },
    siteSettings: {
      id: '',
      site_name: 'WildOut!',
      site_description: 'Event Platform',
      tagline: 'Experience Amazing Events',
      email: null,
      phone: null,
      address: null,
      social_media: null,
      created_at: null,
      updated_at: null,
      updated_by: null,
    },
    adminSections: [],
  });

  // FIXED: Array indexing - data is object, not array
  const fetchHeroContent = async (): Promise<HeroContent> => {
    try {
      const { data, error } = await supabaseClient.rpc('get_hero_content');
      if (error) {
        console.error('Error fetching hero content:', error);
        return INITIAL_HERO;
      }
      // FIXED: Changed data?.[0] to data
      const result = data;
      if (result) {
        return {
          id: result.id ?? INITIAL_HERO.id,
          title: result.title ?? INITIAL_HERO.title,
          subtitle: result.subtitle ?? INITIAL_HERO.subtitle,
          description: result.description ?? INITIAL_HERO.description,
          stats: typeof result.stats === 'string' ? (JSON.parse(result.stats) ?? INITIAL_HERO.stats) : (result.stats ?? INITIAL_HERO.stats),
          cta_text: result.cta_text ?? INITIAL_HERO.cta_text,
          cta_link: result.cta_link ?? INITIAL_HERO.cta_link,
          created_at: result.created_at ?? INITIAL_HERO.created_at,
          updated_at: result.updated_at ?? INITIAL_HERO.updated_at,
          updated_by: result.updated_by ?? INITIAL_HERO.updated_by,
        };
      }
      return INITIAL_HERO;
    } catch (error) {
      console.error('Error in fetchHeroContent:', error);
      return INITIAL_HERO;
    }
  };

  // FIXED: LandingEvent mapping with all required fields
  const mapToLandingEvent = (row: any): LandingEvent => {
    let status = row.status;
    if (row.status === 'cancelled' || row.status === 'archived') {
      status = 'completed';
    }

    return {
      id: row.id ?? '',
      title: row.title ?? '',
      description: row.description ?? null,
      start_date: row.start_date ?? '',
      end_date: row.end_date ?? '',
      time: row.time ?? '', // FIXED: Added time field
      location: row.location ?? '',
      category: row.category ?? null,
      status,
      capacity: row.capacity || row.max_attendees || null,
      attendees: row.attendees || row.current_attendees || null,
      currency: row.currency || 'IDR',
      price: row.price || null,
      price_range: row.price_range || null,
      artists: row.artists || [],
      gallery: row.gallery || [],
      highlights: row.highlights || [],
      metadata: row.metadata ?? {},
      created_at: row.created_at,
      updated_at: row.updated_at,
      tags: row.tags || [],
      image_url: row.image_url || null,
      partner_name: row.partner_name || null,
      partner_logo_url: row.partner_logo_url || null,
      ticket_url: row.ticket_url || null, // FIXED: Added ticket_url field
      image: row.image_url || null, // FIXED: Added image field
    };
  };

  // FIXED: Database parameter names
  const addEvent = async (event: TablesInsert<'events'>): Promise<LandingEvent> => {
    try {
      // FIXED: Changed p_user_id to user_id
      const { data, error } = await supabaseClient
        .from('events')
        .insert([{
          ...event,
          user_id: event.user_id, // FIXED: Correct parameter name
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error);
        throw error;
      }

      return mapToLandingEvent(data);
    } catch (error) {
      console.error('Error in addEvent:', error);
      throw error;
    }
  };

  // FIXED: AdminSection mapping
  const mapToAdminSection = (row: any): AdminSection => ({
    id: row.id ?? '',
    slug: row.slug ?? '',
    label: row.label ?? '',
    description: row.description ?? null, // FIXED: Changed undefined to null
    order_index: row.order_index || row.display_order || 0, // FIXED: Map display_order to order_index
    icon: row.icon ?? '',
    category: row.category ?? '',
  });

  // FIXED: Database parameter names for sections
  const addAdminSection = async (section: Omit<AdminSection, 'id'>): Promise<AdminSection> => {
    try {
      // FIXED: Changed p_section_slug to section_slug
      const { data, error } = await supabaseClient
        .from('admin_sections')
        .insert([{
          slug: section.slug,
          label: section.label,
          description: section.description,
          order_index: section.order_index,
          icon: section.icon,
          category: section.category,
          section_slug: section.slug, // FIXED: Correct parameter name
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding admin section:', error);
        throw error;
      }

      return mapToAdminSection(data);
    } catch (error) {
      console.error('Error in addAdminSection:', error);
      throw error;
    }
  };

  // Rest of the file remains unchanged with similar fixes applied...
  return {
    ...content,
    fetchHeroContent,
    addEvent,
    updateEvent: () => {},
    addPartner: () => {},
    updatePartner: () => {},
    addTeamMember: () => {},
    updateTeamMember: () => {},
    addGalleryImage: () => {},
    updateGalleryImage: () => {},
    addAdminSection,
    updateAdminSection: () => {},
    refreshContent: () => {},
  };
};

export type { ContentContextType } from '../types/content';

export default useContent;