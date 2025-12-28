/* Supabase API Client for Edge Functions */

const SUPABASE_URL = 'https://ufbwljfoejurcbndnalo.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`;

export const supabaseAPI = {
  // Hero Section
  async updateHero(data: any) {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/hero`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update hero');
    }
    
    return response.json();
  },

  async getHero() {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/hero`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch hero');
    }
    
    return response.json();
  },

  // About Section
  async updateAbout(data: any) {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/about`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update about');
    }
    
    return response.json();
  },

  // Events
  async getEvents() {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/events`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch events');
    }
    
    return response.json();
  },

  async updateEvent(id: string, data: any) {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }
    
    return response.json();
  },

  // Team
  async getTeam() {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/team`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch team');
    }
    
    return response.json();
  },

  // Gallery
  async getGallery() {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/gallery`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch gallery');
    }
    
    return response.json();
  },

  // Partners
  async getPartners() {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/partners`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch partners');
    }
    
    return response.json();
  },

  // Settings
  async updateSettings(data: any) {
    const response = await fetch(`${EDGE_FUNCTION_URL}/make-server-41a567c3/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update settings');
    }
    
    return response.json();
  },
};