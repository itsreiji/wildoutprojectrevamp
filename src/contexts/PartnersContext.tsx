import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '../supabase/client';
import type { TablesInsert, TablesUpdate, Json } from '../supabase/types';
import { dummyDataService } from '../services/dummyDataService';
import { cleanupPartnerAsset } from '../utils/storageHelpers';
import type { Partner } from '@/types/content';

interface PartnersContextType {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  useDummyData: boolean;
  setUseDummyData: React.Dispatch<React.SetStateAction<boolean>>;
  addPartner: (partner: TablesInsert<'partners'>) => Promise<Partner>;
  updatePartner: (id: string, updates: TablesUpdate<'partners'>, oldLogoUrl?: string | null) => Promise<Partner>;
  deletePartner: (id: string) => Promise<void>;
  refreshPartners: () => Promise<void>;
}

const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

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

export const PartnersProvider: React.FC<{ children: ReactNode; useDummyData?: boolean }> = ({
  children,
  useDummyData: initialUseDummyData = false
}) => {
  const [useDummyData, setUseDummyData] = useState<boolean>(initialUseDummyData);
  const queryClient = useQueryClient();

  const fetchPartners = async (): Promise<Partner[]> => {
    if (useDummyData) {
      return dummyDataService.getPartners();
    }

    const { data, error } = await supabaseClient
      .from('partners')
      .select('*')
      .eq('status', 'active')
      .order('name');
      
    if (error) throw error;
    
    return (data || []).map((row: any): Partner => ({
      id: row.id,
      name: row.name || '',
      description: row.description || undefined,
      logo_url: row.logo_url || undefined,
      website_url: row.website_url || undefined,
      category: row.category || undefined,
      status: row.status as 'active' | 'inactive' | undefined || undefined,
      featured: row.featured || undefined,
      contact_email: row.contact_email || undefined,
      contact_phone: row.contact_phone || undefined,
      social_links: normalizeSocialLinks(row.social_links),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  };

  const { data: partners = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['partners', useDummyData],
    queryFn: fetchPartners,
  });

  const addPartnerMutation = useMutation({
    mutationFn: async (partner: TablesInsert<'partners'>) => {
      const { data, error } = await supabaseClient
        .from('partners')
        .insert(partner)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert operation');
      
      return {
        id: data.id,
        name: data.name || '',
        description: data.description || undefined,
        logo_url: data.logo_url || undefined,
        website_url: data.website_url || undefined,
        category: undefined,
        status: data.status as 'active' | 'inactive' | undefined || undefined,
        featured: data.featured || undefined,
        contact_email: data.contact_email || undefined,
        contact_phone: data.contact_phone || undefined,
        social_links: normalizeSocialLinks(data.social_links),
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as Partner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, updates, oldLogoUrl }: { id: string; updates: TablesUpdate<'partners'>; oldLogoUrl?: string | null }) => {
      const { data, error } = await supabaseClient
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update operation');

      if (oldLogoUrl && updates.logo_url && oldLogoUrl !== updates.logo_url) {
        await cleanupPartnerAsset(oldLogoUrl);
      }
      
      return {
        id: data.id,
        name: data.name || '',
        description: data.description || undefined,
        logo_url: data.logo_url || undefined,
        website_url: data.website_url || undefined,
        category: undefined,
        status: data.status as 'active' | 'inactive' | undefined || undefined,
        featured: data.featured || undefined,
        contact_email: data.contact_email || undefined,
        contact_phone: data.contact_phone || undefined,
        social_links: normalizeSocialLinks(data.social_links),
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as Partner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: async (id: string) => {
      const partnerToDelete = partners.find(partner => partner.id === id);

      const { error } = await supabaseClient
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (partnerToDelete?.logo_url) {
        await cleanupPartnerAsset(partnerToDelete.logo_url);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });

  const value = {
    partners,
    loading,
    error: queryError ? (queryError as Error).message : null,
    useDummyData,
    setUseDummyData,
    addPartner: async (partner: TablesInsert<'partners'>) => {
      return await addPartnerMutation.mutateAsync(partner);
    },
    updatePartner: async (id: string, updates: TablesUpdate<'partners'>, oldLogoUrl?: string | null) => {
      return await updatePartnerMutation.mutateAsync({ id, updates, oldLogoUrl });
    },
    deletePartner: async (id: string) => {
      await deletePartnerMutation.mutateAsync(id);
    },
    refreshPartners: async () => {
      await refetch();
    }
  };

  return <PartnersContext.Provider value={value}>{children}</PartnersContext.Provider>;
};

export const usePartners = () => {
  const context = useContext(PartnersContext);
  if (!context) throw new Error('usePartners must be used within PartnersProvider');
  return context;
};