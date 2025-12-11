"use client";

// This is the corrected version of events-provider.tsx
// Fixes for TypeScript compilation errors

import { createClientComponentClient } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';
import { LandingEvent } from '../types/content';
import { TablesInsert, TablesUpdate } from '../types/supabase';

const supabaseClient = createClientComponentClient();

export const useEvents = () => {
  const [events, setEvents] = useState<LandingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIXED: LandingEvent mapping with all required fields
  const mapToLandingEvent = (row: any): LandingEvent => {
    let status = row.status;
    if (
      row.status === 'cancelled' ||
      row.status === 'archived'
    ) {
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

  // FIXED: Type conversion issues
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        setError(error.message);
        setEvents([]);
        return;
      }

      if (data) {
        const mappedEvents = data.map(mapToLandingEvent);
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setError('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: Add event with correct type handling
  const addEvent = async (event: TablesInsert<'events'>): Promise<LandingEvent> => {
    try {
      const { data, error } = await supabaseClient
        .from('events')
        .insert([{
          ...event,
          // Ensure all required fields are present
          title: event.title,
          start_date: event.start_date,
          status: event.status || 'draft',
          time: event.time || '', // FIXED: Ensure time field is included
          max_attendees: event.max_attendees || null, // FIXED: Ensure max_attendees field
          current_attendees: event.current_attendees || null, // FIXED: Ensure current_attendees field
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

  // FIXED: Update event with proper type handling
  const updateEvent = async (id: string, updates: TablesUpdate<'events'>): Promise<LandingEvent> => {
    try {
      const { data, error } = await supabaseClient
        .from('events')
        .update({
          ...updates,
          // Ensure time field is handled properly
          time: updates.time !== undefined ? updates.time : undefined,
          max_attendees: updates.max_attendees !== undefined ? updates.max_attendees : undefined,
          current_attendees: updates.current_attendees !== undefined ? updates.current_attendees : undefined,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        throw error;
      }

      return mapToLandingEvent(data);
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  };

  // Rest of the file remains unchanged...
  return {
    events,
    loading,
    error,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  };
};

export type { LandingEvent } from '../types/content';

export default useEvents;