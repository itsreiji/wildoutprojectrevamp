import React, { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { supabaseClient } from '../supabase/client';
import type { Database } from '../supabase/types';

export type AuditLog = Database['public']['Tables']['audit_log']['Row'];


interface AuditFilters {
  table_name?: string;
  action?: string;
  user_id?: string;
}

interface AuditContextType {
  auditLogs: AuditLog[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  fetchAuditLogs: (pageIndex: number, pageSize: number, filters?: AuditFilters) => Promise<void>;
  refetch: () => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async (pageIndex: number = 0, pageSize: number = 10, filters: AuditFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Build filter query
      let query = supabaseClient
        .from('audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      setAuditLogs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(errorMessage);
      console.error('Audit fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => fetchAuditLogs(0, 10), [fetchAuditLogs]);

  return (
    <AuditContext.Provider value={{
      auditLogs,
      totalCount,
      loading,
      error,
      fetchAuditLogs,
      refetch,
    }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within AuditProvider');
  }
  return context;
};