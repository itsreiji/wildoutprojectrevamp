
import { supabase, EDGE_FUNCTION_URL } from '../../lib/supabase';
import {
  HeroSchema,
  AboutSchema,
  EventSchema,
  TeamMemberSchema,
  PartnerSchema,
  SettingsSchema,
  GalleryImageSchema,
  Hero,
  About,
  Event,
  TeamMember,
  Partner,
  Settings,
  GalleryImage,
} from '../../types/schemas';
import { z } from 'zod';

export class SupabaseKVClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = EDGE_FUNCTION_URL;
  }

  private async getAuthHeader(): Promise<string | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.warn('No authenticated user found:', userError?.message);
      return null;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Error getting session for auth header:', sessionError);
      return null;
    }

    console.log('Auth header generated for user:', user.email);
    return session.access_token ? `Bearer ${session.access_token}` : null;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    schema?: z.ZodType<T>,
    body?: any
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authHeader = await this.getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else {
      console.warn('No auth header generated for request to:', endpoint);
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const fullUrl = `${this.baseUrl}${endpoint}`;
      console.log(`API Request: ${method} ${fullUrl}`, { body, headers });

      const response = await fetch(fullUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`API Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;

        if (response.status === 401) {
            throw new Error(`Unauthorized: ${errorMessage}`);
        }
        if (response.status === 404) {
            throw new Error(`Endpoint not found: ${errorMessage}`);
        }
        throw new Error(errorMessage);
      }

      const json = await response.json();

      // If the API returns { data: ... }, extract it
      const result = json.data !== undefined ? json.data : json;

      if (schema) {
        return schema.parse(result);
      }

      return result as T;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`API Timeout [${method} ${endpoint}]: Request took longer than 5 seconds`);
        throw new Error('Request timeout. Please check your internet connection and Supabase configuration.');
      }
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // ========== HERO ==========

  async getHero(): Promise<Hero | null> {
    return this.request('/make-server-41a567c3/hero', 'GET', HeroSchema.nullable());
  }

  async updateHero(data: Hero): Promise<Hero> {
    console.log("SupabaseKVClient.updateHero called with:", data);
    return this.request('/make-server-41a567c3/hero', 'PUT', HeroSchema, data);
  }

  // ========== ABOUT ==========

  async getAbout(): Promise<About | null> {
    return this.request('/make-server-41a567c3/about', 'GET', AboutSchema.nullable());
  }

  async updateAbout(data: About): Promise<About> {
    return this.request('/make-server-41a567c3/about', 'PUT', AboutSchema, data);
  }

  // ========== EVENTS ==========

  async getEvents(): Promise<Event[]> {
    return this.request('/make-server-41a567c3/events', 'GET', z.array(EventSchema));
  }

  async getEvent(id: string): Promise<Event> {
    return this.request(`/make-server-41a567c3/events/${id}`, 'GET', EventSchema);
  }

  async createEvent(data: Event): Promise<Event> {
    return this.request('/make-server-41a567c3/events', 'POST', EventSchema, data);
  }

  async updateEvent(id: string, data: Event): Promise<Event> {
    return this.request(`/make-server-41a567c3/events/${id}`, 'PUT', EventSchema, data);
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request(`/make-server-41a567c3/events/${id}`, 'DELETE');
  }

  // ========== TEAM ==========

  async getTeam(): Promise<TeamMember[]> {
    return this.request('/make-server-41a567c3/team', 'GET', z.array(TeamMemberSchema));
  }

  async createTeamMember(data: TeamMember): Promise<TeamMember> {
    return this.request('/make-server-41a567c3/team', 'POST', TeamMemberSchema, data);
  }

  async updateTeamMember(id: string, data: TeamMember): Promise<TeamMember> {
    return this.request(`/make-server-41a567c3/team/${id}`, 'PUT', TeamMemberSchema, data);
  }

  async deleteTeamMember(id: string): Promise<void> {
    return this.request(`/make-server-41a567c3/team/${id}`, 'DELETE');
  }

  // ========== PARTNERS ==========

  async getPartners(): Promise<Partner[]> {
    return this.request('/make-server-41a567c3/partners', 'GET', z.array(PartnerSchema));
  }

  async createPartner(data: Partner): Promise<Partner> {
    return this.request('/make-server-41a567c3/partners', 'POST', PartnerSchema, data);
  }

  async updatePartner(id: string, data: Partner): Promise<Partner> {
    return this.request(`/make-server-41a567c3/partners/${id}`, 'PUT', PartnerSchema, data);
  }

  async deletePartner(id: string): Promise<void> {
    return this.request(`/make-server-41a567c3/partners/${id}`, 'DELETE');
  }

  // ========== GALLERY ==========

  async getGallery(): Promise<GalleryImage[]> {
    return this.request('/make-server-41a567c3/gallery', 'GET', z.array(GalleryImageSchema));
  }

  async createGalleryImage(data: GalleryImage): Promise<GalleryImage> {
    return this.request('/make-server-41a567c3/gallery', 'POST', GalleryImageSchema, data);
  }

  async deleteGalleryImage(id: string): Promise<void> {
    return this.request(`/make-server-41a567c3/gallery/${id}`, 'DELETE');
  }

  // ========== SETTINGS ==========

  async getSettings(): Promise<Settings | null> {
    return this.request('/make-server-41a567c3/settings', 'GET', SettingsSchema.nullable());
  }

  async updateSettings(data: Settings): Promise<Settings> {
    return this.request('/make-server-41a567c3/settings', 'PUT', SettingsSchema, data);
  }
}

export const apiClient = new SupabaseKVClient();
