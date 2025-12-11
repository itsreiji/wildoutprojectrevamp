'use client';

import { createContext, useContext } from 'react';



import type { Partner } from '../types/content';
import type { TablesInsert, TablesUpdate } from '../types/supabase';


export interface PartnersContextType {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  addPartner: (partner: TablesInsert<'partners'>) => Promise<Partner>;
  updatePartner: (id: string, updates: TablesUpdate<'partners'>) => Promise<Partner>;
  deletePartner: (id: string) => Promise<void>;
}

export const PartnersContext = createContext<PartnersContextType | null>(null);

export function usePartners() {
  const context = useContext(PartnersContext);
  if (!context) {
    throw new Error('usePartners must be used within a PartnersProvider');
  }
  return context;
}
