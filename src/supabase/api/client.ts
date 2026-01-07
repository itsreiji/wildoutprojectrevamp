
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
    try {
      // Get current session directly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('Session error:', sessionError.message);
        return null;
      }

      if (!session) {
        console.warn('No active session found');
        return null;
      }

      // Verify user is still valid
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('User validation failed:', userError?.message);
        return null;
      }

      console.log('✅ Auth header generated for user:', user.email);
      return session.access_token ? `Bearer ${session.access_token}` : null;
    } catch (err) {
      console.error('Unexpected error getting auth header:', err);
      return null;
    }
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

    // For write operations, auth is required
    const requiresAuth = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

    const authHeader = await this.getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    } else if (requiresAuth) {
      throw new Error('Authentication required. Please log in to perform this action.');
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased to 20s for slow Supabase

      const fullUrl = `${this.baseUrl}${endpoint}`;
      console.log(`🚀 API ${method} ${fullUrl}`, body ? { body } : {});

      const response = await fetch(fullUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📥 API Response: ${response.status} ${response.statusText}`);
      console.log(`🔍 Full response details:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          console.log("🔍 Raw error response text:", responseText);
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.log("❌ Failed to parse error response:", parseError);
          errorData = {};
        }

        console.log("🔍 Error data:", errorData);
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;

        // Include detailed validation errors if available
        let detailedMessage = errorMessage;
        if (errorData.details) {
          console.log("📋 Validation error details:", errorData.details);
          if (Array.isArray(errorData.details)) {
            const errorList = errorData.details.map((e: any) => {
              const path = e.path?.join('.') || e.field || 'unknown';
              const message = e.message || e.expected || 'Invalid value';
              return `${path}: ${message}`;
            }).join('; ');
            detailedMessage += ` - ${errorList}`;
          } else {
            detailedMessage += ` - ${JSON.stringify(errorData.details)}`;
          }
        } else if (errorData.receivedBody) {
          // Show what was received to help debug
          console.log("📋 Received body:", errorData.receivedBody);
          detailedMessage += ` - Check server logs for received data`;
        }

        if (response.status === 401) {
          throw new Error(`Authentication failed: ${detailedMessage}. Please log in again.`);
        }
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${detailedMessage}. Check Edge Function deployment.`);
        }
        if (response.status === 500) {
          throw new Error(`Server error: ${detailedMessage}. Check Supabase logs.`);
        }
        throw new Error(detailedMessage);
      }

      const json = await response.json();
      console.log(`🔍 Raw JSON response:`, json);

      // If the API returns { data: ... }, extract it
      // Handle case where data is null/undefined (empty database)
      const result = json.data !== undefined ? json.data : json;
      console.log(`🔍 Extracted result:`, result);

      if (schema) {
        try {
          const parsed = schema.parse(result);
          console.log(`✅ Schema validation passed, returning:`, parsed);
          return parsed;
        } catch (validationError: any) {
          console.error('❌ Schema validation failed:', validationError);
          console.error('🔍 Failed data:', result);
          throw new Error(`Data validation failed: ${validationError.message}`);
        }
      }

      console.log(`⚠️ No schema provided, returning raw result:`, result);
      return result as T;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`⏱️ API Timeout [${method} ${endpoint}]: Request took longer than 10 seconds`);
        throw new Error('Request timeout. Please check your internet connection and Supabase configuration.');
      }
      if (error.message.includes('Authentication required')) {
        throw error;
      }
      console.error(`❌ API Error [${method} ${endpoint}]:`, error);
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
    console.log("🔍 API getTeam() called - fetching current team from server...");
    const result = await this.request('/make-server-41a567c3/team', 'GET', z.array(TeamMemberSchema));
    console.log("🔍 API getTeam() returned:", result);
    return result;
  }

  async createTeamMember(data: TeamMember): Promise<TeamMember> {
    console.log("API: Creating team member:", data);
    const result = await this.request('/make-server-41a567c3/team', 'POST', TeamMemberSchema, data);
    console.log("API: Team member created successfully:", result);
    return result;
  }

  async updateTeamMember(id: string, data: TeamMember): Promise<TeamMember> {
    console.log("API: Updating team member:", id, data);
    const result = await this.request(`/make-server-41a567c3/team/${id}`, 'PUT', TeamMemberSchema, data);
    console.log("API: Team member updated successfully:", result);
    return result;
  }

  async deleteTeamMember(id: string): Promise<void> {
    console.log("API: Deleting team member:", id);
    await this.request(`/make-server-41a567c3/team/${id}`, 'DELETE');
    console.log("API: Team member deleted successfully:", id);
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
    // Settings might not exist yet, so we need to handle null/undefined from the API
    // The endpoint returns { data: undefined } when no settings exist
    try {
      return await this.request('/make-server-41a567c3/settings', 'GET', SettingsSchema.nullable());
    } catch (error: any) {
      // If validation fails because settings don't exist, return null
      if (error.message.includes('Invalid input') || error.message.includes('received undefined')) {
        console.log('⚠️ Settings not found in database, returning null');
        return null;
      }
      throw error;
    }
  }

  async updateSettings(data: Settings): Promise<Settings> {
    console.log("📝 updateSettings called with data:", JSON.stringify(data, null, 2));
    console.log("📋 Data keys:", Object.keys(data));
    if (data.socialMedia) {
      console.log("📱 Social media keys:", Object.keys(data.socialMedia));
    }

    // Validate data against schema before sending to help identify issues
    try {
      SettingsSchema.parse(data);
      console.log("✅ Client-side validation passed");
    } catch (validationError: any) {
      console.error("❌ Client-side validation failed:", validationError.message);
      console.error("📋 Validation errors:", validationError.errors);
      throw new Error(`Client validation failed: ${validationError.message}`);
    }

    return this.request('/make-server-41a567c3/settings', 'PUT', SettingsSchema, data);
  }
}

export const apiClient = new SupabaseKVClient();
