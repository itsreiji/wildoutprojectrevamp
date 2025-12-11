'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { supabaseClient } from '../lib/supabase/client';
import type { LandingEvent } from '../types/content';
import type { TablesInsert, TablesUpdate } from '../types/supabase';

import { useAuth } from './auth-provider';


interface EventsContextType {
  events: LandingEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: TablesInsert<'events'>) => Promise<any>;
  updateEvent: (id: string, updates: TablesUpdate<'events'>) => Promise<any>;
  deleteEvent: (id: string) => Promise<void>;
  fetchEvents: () => Promise<LandingEvent[]>;
}

const EventsContext = createContext<EventsContextType | null>(null);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<LandingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch events from Supabase
  const fetchEvents = async (): Promise<LandingEvent[]> => {
    try {
      const { data, error } = await supabaseClient
        .from('public_events_view')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      const eventsData = (data || []).map((row: any): LandingEvent => {
        // Map database status to LandingEvent status
        let status: LandingEvent['status'] = 'upcoming';
        if (row.status === 'published') {
          // Check if event is ongoing or upcoming based on dates
          const now = new Date();
          const startDate = row.start_date ? new Date(row.start_date) : null;
          const endDate = row.end_date ? new Date(row.end_date) : null;
          if (startDate && endDate && now >= startDate && now <= endDate) {
            status = 'ongoing';
          } else if (endDate && now > endDate) {
            status = 'completed';
          } else {
            status = 'upcoming';
          }
        } else if (row.status === 'ongoing') {
          status = 'ongoing';
        } else if (row.status === 'completed' || row.status === 'cancelled' || row.status === 'archived') {
          status = 'completed';
        }

        return {
          id: row.id ?? '',
          title: row.title ?? '',
          description: row.description ?? null,
          start_date: row.start_date ?? '',
          end_date: row.end_date ?? '',
          time: row.time ?? '',
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
          image_url: row.image_url || '',
          partner_name: row.partner_name || '',
          partner_logo_url: row.partner_logo_url || '',
        };
      }) as LandingEvent[];

      setEvents(eventsData);
      return eventsData;
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setError('Failed to fetch events');
      return [];
    }
  };

  // Add a new event
  const addEvent = async (event: TablesInsert<'events'>) => {
    try {
      const { data, error } = await supabaseClient
        .from('events')
        .insert(event)
        .select()
        .single();

      if (error) throw error;

      setEvents((prev) => [...prev, data as LandingEvent]);
      return data;
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Failed to add event');
      throw err;
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, updates: TablesUpdate<'events'>) => {
    try {
      const { data, error } = await supabaseClient
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEvents((prev) => prev.map((event) => (event.id === id ? (data as LandingEvent) : event)));
      return data;
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      throw err;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('events').delete().eq('id', id);
      if (error) throw error;

      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      throw err;
    }
  };

  // Load events on initial render if user is authenticated
  useEffect(() => {
    if (user) {
      const loadEvents = async () => {
        setLoading(true);
        await fetchEvents();
        setLoading(false);
      };
      loadEvents();
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [user]);

  const value = React.useMemo(() => ({
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
  }), [events, loading, error]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
