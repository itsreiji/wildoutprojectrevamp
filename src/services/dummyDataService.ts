import { DUMMY_EVENTS, DUMMY_PARTNERS, DUMMY_GALLERY_ITEMS, DUMMY_TEAM_MEMBERS } from '../data/dummyData';
import type { LandingEvent, Partner, GalleryImage, TeamMember } from '../types/content';
import type { Json } from '../supabase/types';

// Helper functions for normalization
const normalizeMetadata = (metadata: Json | null | undefined): Record<string, unknown> => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
};

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

export const dummyDataService = {
  getEvents: (): LandingEvent[] => {
    return DUMMY_EVENTS.map((event: any) => {
      const metadata = normalizeMetadata(event.metadata);
      const highlights = ensureStringArray(metadata.highlights as Json) ?? [];
      const galleryImages = ensureStringArray(metadata.gallery as Json) ?? [];
      
      return {
        id: event.id ?? `dummy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: event.title ?? '',
        description: event.description ?? null,
        date: event.start_date ? event.start_date.split('T')[0] : '',
        time: event.start_date ? new Date(event.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        venue: event.location ?? '',
        venueAddress: event.location ?? '',
        image: (metadata.image as string) ?? '',
        category: event.category ?? null,
        status: (event.status as LandingEvent['status']) ?? 'upcoming',
        end_date: event.end_date ?? '',
        capacity: event.capacity ?? undefined,
        attendees: null,
        price: null,
        price_range: event.price_range ?? null,
        ticket_url: event.ticket_url ?? null,
        artists: [],
        gallery: galleryImages,
        highlights,
        start_date: event.start_date ?? '',
        location: event.location ?? null,
        partner_name: event.partner_name ?? null,
        partner_logo_url: null,
        partner_website_url: null,
        metadata,
        created_at: event.created_at ?? event.start_date ?? new Date().toISOString(),
        updated_at: event.updated_at ?? event.end_date ?? new Date().toISOString(),
      };
    });
  },

  getPartners: (): Partner[] => {
    return DUMMY_PARTNERS.map(p => ({
      ...p,
      id: p.id || `partner-${Date.now()}-${Math.random()}`,
      category: null,
      website_url: p.website_url ?? null,
      status: (p.status as 'active' | 'inactive') || 'active',
      social_links: normalizeSocialLinks(p.social_links),
    }));
  },

  getGallery: (): GalleryImage[] => {
    return DUMMY_GALLERY_ITEMS.map(g => {
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
    });
  },

  getTeam: (): TeamMember[] => {
    return DUMMY_TEAM_MEMBERS.map(t => ({
      ...t,
      id: t.id || `team-${Date.now()}-${Math.random()}`,
      role: null,
      phone: null,
      photoUrl: null,
      social_links: normalizeSocialLinks(t.social_links),
      status: (t.status as 'active' | 'inactive') || 'active',
    }));
  }
};