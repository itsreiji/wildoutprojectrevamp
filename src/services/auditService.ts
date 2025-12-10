import supabase from '../supabase/client'; // Import default export

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'REGISTER_SUCCESS'
  | 'REGISTER_FAILURE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_UPDATE';

interface LogEntry {
  action: AuditAction;
  userId?: string;
  userRole?: string;
  recordId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  /**
   * Log a security event to the audit log
   */
  logEvent: async ({ action, userId, userRole, recordId, details, ipAddress, userAgent }: LogEntry) => {
    try {
      const { error } = await supabase
        .from('audit_log')
        .insert({
          action,
          table_name: 'auth',
          record_id: recordId || userId || 'system',
          user_id: userId || null,
          user_role: userRole || 'anonymous',
          new_data: details || null,
          ip_address: ipAddress || null,
          user_agent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
        });

      if (error) {
        console.error('Failed to log audit event:', error);
        throw error; // Re-throw to allow calling functions to handle the error
      }

      return { success: true };
    } catch (err) {
      console.error('Error logging audit event:', err);
      throw err; // Re-throw to allow calling functions to handle the error
    }
  },

  /**
   * Log a successful login
   */
  logLoginSuccess: async (userId: string, role: string, provider: string) => {
    return await auditService.logEvent({
      action: 'LOGIN_SUCCESS',
      userId,
      userRole: role,
      recordId: userId,
      details: { provider },
    });
  },

  /**
   * Log a failed login attempt
   */
  logLoginFailure: async (email: string, reason: string) => {
    return await auditService.logEvent({
      action: 'LOGIN_FAILURE',
      recordId: email,
      details: { email, reason },
    });
  },

  /**
   * Log a logout event
   */
  logLogout: async (userId: string) => {
    return await auditService.logEvent({
      action: 'LOGOUT',
      userId,
    });
  }
};
