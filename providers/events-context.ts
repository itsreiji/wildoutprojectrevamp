'use client';

import { createContext, useContext } from 'react';



import type { LandingEvent } from '../types/content';
import type { TablesInsert, TablesUpdate } from '../types/supabase';


export interface EventsContextType {
  events: LandingEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: TablesInsert<'events'>) => Promise<LandingEvent>;
  updateEvent: (id: string, updates: TablesUpdate<'events'>) => Promise<LandingEvent>;
  deleteEvent: (id: string) => Promise<void>;
  fetchEvents: () => Promise<LandingEvent[]>;
}

export const EventsContext = createContext<EventsContextType | null>(null);

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
