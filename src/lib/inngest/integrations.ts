/**
 * Inngest Integrations with Wildout Project Services
 * 
 * This file provides integrations between Inngest functions and your existing services.
 */

import { inngestClient } from './client';
import { auditService } from '../../services/auditService';
import { supabaseClient } from '../../supabase/client';

/**
 * Enhanced audit logging function using your existing auditService
 */
export const enhancedAuditLogger = inngestClient.createFunction(
  {
    id: 'enhanced-audit-logger',
    name: 'Enhanced Audit Logger',
    retries: 3, // Retry up to 3 times on failure
  },
  { event: 'audit/log' },
  async ({ event, step }) => {
    const { action, userId, details } = event.data;

    // Step 1: Log using existing audit service
    const logResult = await step.run('log-audit-event', async () => {
      try {
        await auditService.logEvent({
          action: action as any,
          userId,
          details,
        });
        return { success: true };
      } catch (error) {
        console.error('Audit logging failed:', error);
        throw error; // Will trigger retry
      }
    });

    // Step 2: Security monitoring for suspicious patterns
    await step.run('security-monitor', async () => {
      // Check for multiple failed login attempts
      if (action === 'LOGIN_FAILURE') {
        const { data: recentFailures } = await supabaseClient
          .from('audit_log')
          .select('id')
          .eq('action', 'LOGIN_FAILURE')
          .eq('user_id', userId)
          .gt('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
          .limit(5);

        if (recentFailures && recentFailures.length >= 3) {
          // Trigger security alert
          console.log(`SECURITY ALERT: Multiple failed logins for user ${userId}`);
          
          // You could send a security email here
          await step.sendEvent('security-alert', {
            name: 'security/alert',
            data: {
              type: 'multiple_failed_logins',
              userId,
              attempts: recentFailures.length,
              timestamp: Date.now(),
            },
          });
        }
      }

      return { monitored: true };
    });

    return {
      ...logResult,
      action,
      userId,
    };
  }
);

/**
 * User registration workflow with welcome email and audit trail
 */
export const userRegistrationWorkflow = inngestClient.createFunction(
  {
    id: 'user-registration-workflow',
    name: 'User Registration Workflow',
    retries: 2,
  },
  { event: 'user/registered' },
  async ({ event, step }) => {
    const { userId, email } = event.data;

    // Step 1: Log registration in audit trail
    await step.run('log-registration', async () => {
      await auditService.logEvent({
        action: 'REGISTER_SUCCESS',
        userId,
        userRole: 'user',
        details: { email, source: 'registration_workflow' },
      });
      return { logged: true };
    });

    // Step 2: Send welcome email (mock - replace with real service)
    await step.run('send-welcome-email', async () => {
      // In production, integrate with SendGrid, Resend, AWS SES, etc.
      console.log(`📧 WELCOME EMAIL: Sending to ${email}`);
      
      // Example integration with a real email service:
      // await emailService.send({
      //   to: email,
      //   subject: 'Welcome to Wildout!',
      //   template: 'welcome',
      //   data: { userId, email }
      // });
      
      return {
        sent: true,
        provider: 'mock',
        timestamp: new Date().toISOString(),
      };
    });

    // Step 3: Create user profile record (if needed)
    await step.run('create-user-profile', async () => {
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .insert({
          user_id: userId,
          email,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn('Profile creation failed (non-critical):', error.message);
        // Don't throw - this is non-critical
        return { created: false, reason: error.message };
      }

      return { created: true, profileId: data.id };
    });

    return {
      userId,
      email,
      status: 'completed',
    };
  }
);

/**
 * Event creation workflow with validation and notifications
 */
export const eventCreationWorkflow = inngestClient.createFunction(
  {
    id: 'event-creation-workflow',
    name: 'Event Creation Workflow',
    retries: 1,
  },
  { event: 'event/created' },
  async ({ event, step }) => {
    const { eventId, title, createdBy } = event.data;

    // Step 1: Validate event data
    const eventDetails = await step.run('validate-event', async () => {
      const { data, error } = await supabaseClient
        .from('events')
        .select('*, venues!inner(name), team_members!inner(name)')
        .eq('id', eventId)
        .single();

      if (error || !data) {
        throw new Error(`Event validation failed: ${error?.message || 'Event not found'}`);
      }

      // Validate required fields
      if (!data.title || !data.date || !data.venue_id) {
        throw new Error('Event missing required fields');
      }

      return data;
    });

    // Step 2: Log to audit trail
    await step.run('log-event-creation', async () => {
      await auditService.logContentAction(
        createdBy,
        'admin', // Assuming creator is admin
        'CREATE',
        'EVENT',
        eventId,
        { title, venue: eventDetails.venues?.name }
      );
      return { logged: true };
    });

    // Step 3: Notify relevant parties
    await step.run('send-notifications', async () => {
      // Example: Send notifications to admins or subscribers
      console.log(`📢 NEW EVENT: "${title}" created by ${createdBy}`);
      
      // You could:
      // - Send Slack notification
      // - Email subscribers
      // - Update social media
      // - Create calendar events
      
      return {
        notifications: ['admin-dashboard', 'email-list'],
        eventTitle: title,
      };
    });

    return {
      eventId,
      title,
      status: 'processed',
    };
  }
);

/**
 * Batch email processor with rate limiting
 */
export const batchEmailProcessor = inngestClient.createFunction(
  {
    id: 'batch-email-processor',
    name: 'Batch Email Processor',
    concurrency: 5, // Limit concurrent executions
    rateLimit: {
      limit: 100, // Max 100 events per period
      period: '1m', // Per minute
    },
  },
  { event: 'email/send' },
  async ({ event, step }) => {
    const { to, subject, body } = event.data;

    // Step 1: Validate email
    await step.run('validate-email', async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        throw new Error(`Invalid email: ${to}`);
      }
      return { valid: true };
    });

    // Step 2: Send email (mock implementation)
    const result = await step.run('send-email', async () => {
      // Replace with actual email service integration
      console.log(`📧 EMAIL: ${subject} → ${to}`);
      
      // Example with real service:
      // const emailResult = await emailService.send({ to, subject, body });
      // return emailResult;
      
      return {
        sent: true,
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: 'mock',
      };
    });

    // Step 3: Log email activity
    await step.run('log-email-activity', async () => {
      await auditService.logEvent({
        action: 'EMAIL_SENT',
        details: {
          to,
          subject,
          messageId: result.messageId,
        },
      });
      return { logged: true };
    });

    return {
      to,
      subject,
      ...result,
    };
  }
);

/**
 * Data cleanup and maintenance workflow
 */
export const maintenanceWorkflow = inngestClient.createFunction(
  {
    id: 'maintenance-workflow',
    name: 'Maintenance Workflow',
    retries: 0, // Don't retry maintenance tasks
  },
  { event: 'system/maintenance' },
  async ({ event, step }) => {
    const { task } = event.data;

    // Step 1: Clean up old audit logs (keep last 90 days)
    if (task === 'cleanup-audit-logs') {
      const result = await step.run('cleanup-audit-logs', async () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        const { data, error } = await supabaseClient
          .from('audit_log')
          .delete()
          .lt('created_at', cutoffDate.toISOString());

        if (error) {
          throw new Error(`Cleanup failed: ${error.message}`);
        }

        return {
          deleted: data?.length || 0,
          cutoff: cutoffDate.toISOString(),
        };
      });

      return result;
    }

    // Step 2: Generate usage statistics
    if (task === 'generate-stats') {
      const stats = await step.run('generate-stats', async () => {
        const { data: userCount } = await supabaseClient
          .from('users')
          .select('id', { count: 'exact', head: true });

        const { data: eventCount } = await supabaseClient
          .from('events')
          .select('id', { count: 'exact', head: true });

        const { data: auditCount } = await supabaseClient
          .from('audit_log')
          .select('id', { count: 'exact', head: true });

        return {
          users: userCount || 0,
          events: eventCount || 0,
          auditLogs: auditCount || 0,
          timestamp: new Date().toISOString(),
        };
      });

      return stats;
    }

    return { task, status: 'unknown-task' };
  }
);

// Export all integrations
export const inngestIntegrations = [
  enhancedAuditLogger,
  userRegistrationWorkflow,
  eventCreationWorkflow,
  batchEmailProcessor,
  maintenanceWorkflow,
];