'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabaseClient } from '../lib/supabase/client';
import { useAuth } from './auth-provider';
import type { TablesInsert, TablesUpdate } from '../types/supabase';
import type { Partner } from '../types/content';

interface PartnersContextType {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  addPartner: (partner: TablesInsert<'partners'>) => Promise<any>;
  updatePartner: (id: string, updates: TablesUpdate<'partners'>) => Promise<any>;
  deletePartner: (id: string) => Promise<void>;
}

const PartnersContext = createContext<PartnersContextType | null>(null);

export function PartnersProvider({ children }: { children: ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Helper function to normalize social links
  const normalizeSocialLinks = (value: any): Record<string, string | null> => {
    if (!value || typeof value === 'string') return {};
    if (Array.isArray(value)) return {};
    return Object.entries(value as Record<string, any>).reduce<Record<string, string | null>>(
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

  // Fetch partners from Supabase
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('partners')
        .select('*')
        .eq('status', 'active')
        .order('name');
        
      if (error) {
        console.error('Error fetching partners:', error);
        throw error;
      }

      const partnersData = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name || '',
        description: row.description || undefined,
        logo_url: row.logo_url || undefined,
        website_url: row.website_url || undefined,
        category: row.category || undefined,
        status: row.status as 'active' | 'inactive' | undefined || 'active',
        contact_email: row.contact_email || undefined,
        contact_phone: row.contact_phone || undefined,
        social_links: normalizeSocialLinks(row.social_links),
        created_at: row.created_at,
        updated_at: row.updated_at,
        address: row.address || null,
        city: row.city || null,
        country: row.country || null,
      }));

      setPartners(partnersData);
    } catch (error) {
      console.error('Error in fetchPartners:', error);
      setError('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  // Add a new partner
  const addPartner = async (partner: TablesInsert<'partners'>) => {
    try {
      const { data, error } = await supabaseClient
        .from('partners')
        .insert(partner)
        .select()
        .single();

      if (error) throw error;

      setPartners((prev) => [...prev, data as Partner]);
      return data;
    } catch (err) {
      console.error('Error adding partner:', err);
      setError('Failed to add partner');
      throw err;
    }
  };

  // Update an existing partner
  const updatePartner = async (id: string, updates: TablesUpdate<'partners'>) => {
    try {
      const { data, error } = await supabaseClient
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPartners((prev) => prev.map((partner) => (partner.id === id ? (data as Partner) : partner)));
      return data;
    } catch (err) {
      console.error('Error updating partner:', err);
      setError('Failed to update partner');
      throw err;
    }
  };

  // Delete a partner
  const deletePartner = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('partners').delete().eq('id', id);
      if (error) throw error;

      setPartners((prev) => prev.filter((partner) => partner.id !== id));
    } catch (err) {
      console.error('Error deleting partner:', err);
      setError('Failed to delete partner');
      throw err;
    }
  };

  // Load partners on initial render if user is authenticated
  useEffect(() => {
    if (user) {
      fetchPartners();
    } else {
      setPartners([]);
      setLoading(false);
    }
  }, [user]);

  const value = {
    partners,
    loading,
    error,
    addPartner,
    updatePartner,
    deletePartner,
  };

  return <PartnersContext.Provider value={value}>{children}</PartnersContext.Provider>;
}

export function usePartners() {
  const context = useContext(PartnersContext);
  if (!context) {
    throw new Error('usePartners must be used within a PartnersProvider');
  }
  return context;
}