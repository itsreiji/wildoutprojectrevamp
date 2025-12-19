import React, { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '../supabase/client';
import type { TablesInsert, TablesUpdate, Json } from '../supabase/types';
import { cleanupTeamMemberAsset } from '../utils/storageHelpers';
import type { TeamMember } from '@/types/content';

interface TeamContextType {
  team: TeamMember[];
  loading: boolean;
  error: string | null;
  addTeamMember: (member: TablesInsert<'team_members'>) => Promise<TeamMember>;
  updateTeamMember: (id: string, updates: TablesUpdate<'team_members'>, oldAvatarUrl?: string | null) => Promise<TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;
  refreshTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

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

export const TeamProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const queryClient = useQueryClient();

  const fetchTeamMembers = async (): Promise<TeamMember[]> => {

    const { data, error } = await supabaseClient
      .from('team_members')
      .select('*')
      .eq('status', 'active')
      .order('display_order')
      .order('name');

    if (error) throw error;

    return (data || []).map((row: any): TeamMember => ({
      id: row.id,
      name: row.name || '',
      title: row.title || row.role || undefined,
      bio: row.bio || undefined,
      avatar_url: row.avatar_url && row.avatar_url.trim().length > 0 ? row.avatar_url : null,
      email: row.email || undefined,
      status: row.status as 'active' | 'inactive' | undefined || undefined,
      social_links: normalizeSocialLinks(row.social_links),
      display_order: row.display_order || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  };

  const { data: team = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['team'],
    queryFn: fetchTeamMembers,
  });

  const addTeamMemberMutation = useMutation({
    mutationFn: async (member: TablesInsert<'team_members'>) => {
      const { data, error } = await supabaseClient
        .from('team_members')
        .insert(member)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert operation');

      return {
        id: data.id,
        name: data.name || '',
        title: data.title || undefined,
        bio: data.bio || undefined,
        avatar_url: data.avatar_url && data.avatar_url.trim().length > 0 ? data.avatar_url : null,
        email: data.email || undefined,
        status: data.status as 'active' | 'inactive' | undefined || undefined,
        social_links: normalizeSocialLinks(data.social_links),
        display_order: undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as TeamMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ id, updates, oldAvatarUrl }: { id: string; updates: TablesUpdate<'team_members'>; oldAvatarUrl?: string | null }) => {
      const { data, error } = await supabaseClient
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update operation');

      if (oldAvatarUrl && updates.avatar_url && oldAvatarUrl !== updates.avatar_url) {
        await cleanupTeamMemberAsset(oldAvatarUrl);
      }

      return {
        id: data.id,
        name: data.name || '',
        title: data.title || undefined,
        bio: data.bio || undefined,
        avatar_url: data.avatar_url && data.avatar_url.trim().length > 0 ? data.avatar_url : null,
        email: data.email || undefined,
        status: data.status as 'active' | 'inactive' | undefined || undefined,
        social_links: normalizeSocialLinks(data.social_links),
        display_order: undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as TeamMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const memberToDelete = team.find(member => member.id === id);

      const { error } = await supabaseClient
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (memberToDelete?.avatar_url) {
        await cleanupTeamMemberAsset(memberToDelete.avatar_url);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  const value = {
    team,
    loading,
    error: queryError ? (queryError as Error).message : null,
    addTeamMember: async (member: TablesInsert<'team_members'>) => {
      return await addTeamMemberMutation.mutateAsync(member);
    },
    updateTeamMember: async (id: string, updates: TablesUpdate<'team_members'>, oldAvatarUrl?: string | null) => {
      return await updateTeamMemberMutation.mutateAsync({ id, updates, oldAvatarUrl });
    },
    deleteTeamMember: async (id: string) => {
      await deleteTeamMemberMutation.mutateAsync(id);
    },
    refreshTeam: async () => {
      await refetch();
    }
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
};