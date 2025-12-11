'use client';

import React, { useState, ReactNode, useEffect, useCallback } from 'react';

import { supabaseClient } from '../lib/supabase/client';
import type { TeamMember } from '../types/content';
import type { Database, Json, TablesInsert, TablesUpdate } from '../types/supabase';

import { useAuth } from './auth-context';
import { TeamContext } from './team-context';


export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Helper function to normalize social links
  const normalizeSocialLinks = (value: Json): Record<string, string | null> => {
    if (!value || typeof value === 'string') return {};
    if (Array.isArray(value)) return {};
    return Object.entries(value as Record<string, Json>).reduce<Record<string, string | null>>(
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
      {},
    );
  };

  // Fetch team members from Supabase
  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('team_members')
        .select('*')
        .eq('status', 'active')
        .order('display_order')
        .order('name');

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      const teamData = (data || []).map((row: Database['public']['Tables']['team_members']['Row']) => ({
        id: row.id,
        name: row.name || '',
        title: row.title || row.role || undefined,
        bio: row.bio || undefined,
        avatar_url: row.avatar_url || undefined,
        email: row.email || undefined,
        status: row.status as 'active' | 'inactive' | undefined || 'active',
        social_links: normalizeSocialLinks(row.social_links),
        display_order: row.display_order || undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
        linkedin_url: row.linkedin_url || null,
      }));

      setTeam(teamData);
    } catch (error) {
      console.error('Error in fetchTeamMembers:', error);
      setError('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new team member
  const addTeamMember = useCallback(async (member: TablesInsert<'team_members'>) => {
    try {
      const { data, error } = await supabaseClient
        .from('team_members')
        .insert(member)
        .select()
        .single();

      if (error) throw error;

      setTeam((prev) => [...prev, data as TeamMember]);
      return data as TeamMember;
    } catch (err) {
      console.error('Error adding team member:', err);
      setError('Failed to add team member');
      throw err;
    }
  }, []);

  // Update an existing team member
  const updateTeamMember = useCallback(async (id: string, updates: TablesUpdate<'team_members'>) => {
    try {
      const { data, error } = await supabaseClient
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTeam((prev) => prev.map((member) => (member.id === id ? (data as TeamMember) : member)));
      return data as TeamMember;
    } catch (err) {
      console.error('Error updating team member:', err);
      setError('Failed to update team member');
      throw err;
    }
  }, []);

  // Delete a team member
  const deleteTeamMember = useCallback(async (id: string) => {
    try {
      const { error } = await supabaseClient.from('team_members').delete().eq('id', id);
      if (error) throw error;

      setTeam((prev) => prev.filter((member) => member.id !== id));
    } catch (err) {
      console.error('Error deleting team member:', err);
      setError('Failed to delete team member');
      throw err;
    }
  }, []);

  // Load team members on initial render if user is authenticated
  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    } else {
      setTeam([]);
      setLoading(false);
    }
  }, [user, fetchTeamMembers]);

  const value = React.useMemo(() => ({
    team,
    loading,
    error,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
  }), [team, loading, error, addTeamMember, updateTeamMember, deleteTeamMember]);

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
