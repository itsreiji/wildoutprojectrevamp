/**
 * Practical Examples: Using Inngest with Wildout Project
 * 
 * This file shows how to integrate Inngest into your existing components and services.
 */

import { inngestClient } from './client';
import { auditService } from '../../services/auditService';
import { supabaseClient } from '../../supabase/client';

// ==================== AUTH CONTEXT INTEGRATION ====================

/**
 * Example: Enhanced AuthContext with Inngest events
 * 
 * In your AuthContext.tsx, you would add these calls:
 */

export const authContextIntegration = {
  // In your login function:
  onLoginSuccess: async (userId: string, email: string, role: string) => {
    // Existing audit logging
    await auditService.logLoginSuccess(userId, role, 'email');
    
    // NEW: Trigger Inngest workflow
    await inngestClient.send({
      name: 'user/registered', // Or create a new event like 'user/login'
      data: {
        userId,
        email,
        timestamp: Date.now(),
      },
    });
  },

  onLoginFailure: async (email: string, reason: string) => {
    // Existing audit logging
    await auditService.logLoginFailure(email, reason);
    
    // NEW: Trigger security monitoring
    await inngestClient.send({
      name: 'audit/log',
      data: {
        action: 'LOGIN_FAILURE',
        userId: email, // Use email as identifier for failed logins
        details: { email, reason, timestamp: Date.now() },
      },
    });
  },

  onRegisterSuccess: async (userId: string, email: string) => {
    // NEW: Trigger complete registration workflow
    await inngestClient.send({
      name: 'user/registered',
      data: {
        userId,
        email,
        timestamp: Date.now(),
      },
    });
  },
};

// ==================== DASHBOARD COMPONENT INTEGRATION ====================

/**
 * Example: Dashboard Event Creation with Inngest
 * 
 * In your DashboardEventForm.tsx:
 */

export const dashboardEventIntegration = {
  onEventCreated: async (eventId: string, title: string, userId: string) => {
    // Existing: Save to database
    // NEW: Trigger event processing workflow
    await inngestClient.send({
      name: 'event/created',
      data: {
        eventId,
        title,
        createdBy: userId,
      },
    });
  },

  onEventUpdated: async (eventId: string, changes: Record<string, any>, userId: string) => {
    // Log the update
    await auditService.logContentAction(
      userId,
      'admin',
      'UPDATE',
      'EVENT',
      eventId,
      changes
    );
    
    // NEW: Trigger any post-update workflows
    await inngestClient.send({
      name: 'audit/log',
      data: {
        action: 'UPDATE',
        userId,
        details: {
          table: 'events',
          recordId: eventId,
          changes,
        },
      },
    });
  },
};

// ==================== ADMIN DASHBOARD INTEGRATION ====================

/**
 * Example: Admin Dashboard with Inngest-powered features
 * 
 * In your AdminDashboard.tsx:
 */

export const adminDashboardIntegration = {
  // Bulk operations with Inngest
  bulkUserImport: async (users: Array<{ email: string; role: string }>, adminId: string) => {
    // Log the bulk action
    await auditService.logEvent({
      action: 'BULK_IMPORT',
      userId: adminId,
      details: { count: users.length, type: 'users' },
    });

    // NEW: Trigger batch processing
    for (const user of users) {
      await inngestClient.send({
        name: 'user/registered',
        data: {
          userId: `bulk_${Date.now()}_${Math.random()}`,
          email: user.email,
          timestamp: Date.now(),
        },
      });
    }
  },

  // Maintenance tasks
  runMaintenance: async (task: string, adminId: string) => {
    await auditService.logEvent({
      action: 'MAINTENANCE',
      userId: adminId,
      details: { task },
    });

    // NEW: Trigger maintenance workflow
    await inngestClient.send({
      name: 'system/maintenance',
      data: {
        task,
        triggeredBy: adminId,
      },
    });
  },
};

// ==================== EMAIL NOTIFICATIONS ====================

/**
 * Example: Email notifications through Inngest
 * 
 * Replace direct email calls with Inngest events
 */

export const emailIntegration = {
  // Instead of: await emailService.send(...)
  // Use: await emailIntegration.sendWelcome(...)
  
  sendWelcome: async (to: string, name: string) => {
    await inngestClient.send({
      name: 'email/send',
      data: {
        to,
        subject: `Welcome to Wildout, ${name}!`,
        body: `Hello ${name}, welcome to our platform!`,
      },
    });
  },

  sendEventNotification: async (to: string, eventTitle: string, eventDate: string) => {
    await inngestClient.send({
      name: 'email/send',
      data: {
        to,
        subject: `New Event: ${eventTitle}`,
        body: `Check out our new event: ${eventTitle} on ${eventDate}`,
      },
    });
  },

  sendSecurityAlert: async (to: string, reason: string) => {
    await inngestClient.send({
      name: 'email/send',
      data: {
        to,
        subject: 'Security Alert',
        body: `Security alert: ${reason}`,
      },
    });
  },
};

// ==================== REAL-TIME MONITORING ====================

/**
 * Example: Real-time monitoring with Inngest
 * 
 * Track user activity and system health
 */

export const monitoringIntegration = {
  trackUserActivity: async (userId: string, action: string, metadata: Record<string, any> = {}) => {
    await inngestClient.send({
      name: 'audit/log',
      data: {
        action,
        userId,
        details: {
          ...metadata,
          timestamp: Date.now(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        },
      },
    });
  },

  trackPerformance: async (metric: string, value: number, userId?: string) => {
    await inngestClient.send({
      name: 'audit/log',
      data: {
        action: `PERF_${metric.toUpperCase()}`,
        userId: userId || 'system',
        details: {
          metric,
          value,
          timestamp: Date.now(),
        },
      },
    });
  },
};

// ==================== PRACTICAL USAGE EXAMPLES ====================

/**
 * Complete example: User registration flow
 */

export async function completeUserRegistrationFlow(email: string, password: string) {
  // 1. Create user in Supabase
  const { data: userData, error: authError } = await supabaseClient.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  // 2. Log to audit service (existing)
  await auditService.logEvent({
    action: 'REGISTER_SUCCESS',
    userId: userData.user?.id,
    userRole: 'user',
    details: { email },
  });

  // 3. Trigger Inngest workflow (NEW)
  await inngestClient.send({
    name: 'user/registered',
    data: {
      userId: userData.user!.id,
      email,
      timestamp: Date.now(),
    },
  });

  return userData;
}

/**
 * Complete example: Create event with notifications
 */

export async function createEventWithNotifications(
  eventData: {
    title: string;
    description: string;
    date: string;
    venue_id: string;
  },
  userId: string
) {
  // 1. Create event in database
  const { data: event, error } = await supabaseClient
    .from('events')
    .insert({
      ...eventData,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Log to audit service (existing)
  await auditService.logContentAction(
    userId,
    'admin',
    'CREATE',
    'EVENT',
    event.id,
    { title: event.title }
  );

  // 3. Trigger Inngest workflow (NEW)
  await inngestClient.send({
    name: 'event/created',
    data: {
      eventId: event.id,
      title: event.title,
      createdBy: userId,
    },
  });

  return event;
}

/**
 * Complete example: Security monitoring
 */

export async function handleFailedLogin(email: string, reason: string) {
  // 1. Log to audit service (existing)
  await auditService.logLoginFailure(email, reason);

  // 2. Trigger Inngest security monitoring (NEW)
  await inngestClient.send({
    name: 'audit/log',
    data: {
      action: 'LOGIN_FAILURE',
      userId: email,
      details: {
        email,
        reason,
        timestamp: Date.now(),
      },
    },
  });

  // 3. Check for suspicious patterns
  const { data: recentFailures } = await supabaseClient
    .from('audit_log')
    .select('id')
    .eq('action', 'LOGIN_FAILURE')
    .eq('user_id', email)
    .gt('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .limit(5);

  if (recentFailures && recentFailures.length >= 3) {
    // Trigger immediate security alert
    await inngestClient.send({
      name: 'email/send',
      data: {
        to: 'admin@wildout.com',
        subject: 'Security Alert: Multiple Failed Logins',
        body: `User ${email} has ${recentFailures.length} failed login attempts in 15 minutes.`,
      },
    });
  }
}

// ==================== REACT HOOK USAGE ====================

/**
 * Example: Using Inngest hooks in React components
 * 
 * In your components:
 */

/*
import { useUserRegistration, useEventCreation, useAuditLog } from '@/lib/inngest';

function RegistrationForm() {
  const { triggerWelcomeEmail, loading, error } = useUserRegistration();
  
  const handleSubmit = async (email: string) => {
    try {
      const user = await createUser(email);
      await triggerWelcomeEmail(user.id, email);
      // User gets welcome email automatically via Inngest
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };
  
  // ...
}

function EventForm() {
  const { triggerEventCreated } = useEventCreation();
  
  const handleCreateEvent = async (eventData: any) => {
    const event = await createEvent(eventData);
    await triggerEventCreated(event.id, event.title, currentUser.id);
    // Event processing happens in background
  };
}
*/