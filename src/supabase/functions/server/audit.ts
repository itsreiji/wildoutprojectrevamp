export { };

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

interface AuditLog {
  action: string;
  table_name: string;
  record_id?: string;
  user_id?: string;
  user_role?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
}

export const logAuditEvent = async (logEntry: AuditLog): Promise<void> => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing required environment variables for Supabase client');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false, // No persistence needed in edge functions
      },
    });

    const { error } = await supabase
      .from('audit_log')
      .insert([{
        action: logEntry.action,
        table_name: logEntry.table_name,
        record_id: logEntry.record_id,
        user_id: logEntry.user_id,
        user_role: logEntry.user_role,
        old_data: logEntry.old_data,
        new_data: logEntry.new_data,
        ip_address: logEntry.ip_address,
        user_agent: logEntry.user_agent,
        details: logEntry.details,
      }]);

    if (error) {
      console.error('Failed to log audit event:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error logging audit event:', err);
    throw err;
  }
};