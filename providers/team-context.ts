'use client';

import { createContext, useContext } from 'react';

import type { TeamMember } from '../types/content';
import type { TablesInsert, TablesUpdate } from '../types/supabase';

export interface TeamContextType {
  team: TeamMember[];
  loading: boolean;
  error: string | null;
  addTeamMember: (member: TablesInsert<'team_members'>) => Promise<TeamMember>;
  updateTeamMember: (id: string, updates: TablesUpdate<'team_members'>) => Promise<TeamMember>;
  deleteTeamMember: (id: string) => Promise<void>;
}

export const TeamContext = createContext<TeamContextType | null>(null);

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
