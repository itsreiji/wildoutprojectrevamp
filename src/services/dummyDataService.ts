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
        image: (metadata.image as string) ?? event.image_url ?? '',
        category: event.category ?? null,
        status: (event.status as LandingEvent['status']) ?? 'upcoming',
        end_date: event.end_date ?? '',
        capacity: event.max_attendees ?? undefined,
        attendees: null,
        price: null,
        price_range: (metadata.price_range as string) ?? null,
        ticket_url: (metadata.ticket_url as string) ?? event.website_url ?? null,
        artists: [],
        gallery: galleryImages,
        highlights,
        start_date: event.start_date ?? '',
        location: event.location ?? null,
        partner_name: event.partner_name ?? null,
        partner_logo_url: null,
        partner_website_url: null,
        metadata: metadata as Json,
        tags: event.tags ?? null,
        image_url: event.image_url ?? null,
        currency: event.currency ?? null,
        created_at: event.created_at ?? event.start_date ?? new Date().toISOString(),
        updated_at: event.updated_at ?? event.end_date ?? new Date().toISOString(),
      };
    });
  },

  getPartners: (): Partner[] => {
    return DUMMY_PARTNERS.map(p => ({
      ...p,
      id: p.id || `partner-${Date.now()}-${Math.random()}`,
      category: p.category ?? '',
      website_url: p.website_url ?? null,
      status: (p.status as 'active' | 'inactive') || 'active',
      social_links: normalizeSocialLinks(p.social_links),
      featured: p.featured ?? false,
      description: p.description ?? null,
      logo_url: p.logo_url ?? null,
    }));
  },

  getGallery: (): GalleryImage[] => {
    return DUMMY_GALLERY_ITEMS.map(g => {
      const metadata = normalizeMetadata(g.metadata);
      const imageUrls = ensureStringArray(metadata.image_urls as Json) ?? [];
      return {
        id: g.id || `gallery-${Date.now()}-${Math.random()}`,
        title: g.title ?? '',
        description: g.description ?? null,
        category: g.category ?? '',
        status: g.status ?? 'published',
        tags: Array.isArray(g.tags) ? g.tags.filter((tag): tag is string => typeof tag === 'string') : [],
        image_url: g.image_url ?? '',
        display_order: g.display_order ?? null,
        event_id: g.event_id ?? null,
        metadata: metadata as Json,
        created_at: g.created_at ?? new Date().toISOString(),
        updated_at: g.updated_at ?? new Date().toISOString(),
      };
    });
  },

  getTeam: (): TeamMember[] => {
    return DUMMY_TEAM_MEMBERS.map(t => ({
      ...t,
      id: t.id || `team-${Date.now()}-${Math.random()}`,
      title: t.title ?? null,
      bio: t.bio ?? null,
      avatar_url: t.avatar_url ?? null,
      email: t.email ?? null,
      social_links: normalizeSocialLinks({
        linkedin: t.linkedin_url,
        twitter: t.twitter_handle
      }),
      status: (t.status as 'active' | 'inactive') || 'active',
    }));
  }
};