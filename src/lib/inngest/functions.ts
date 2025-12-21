import { inngestClient } from './client';
import { supabaseClient } from '../../supabase/client';
import { auditService } from '../../services/auditService';

/**
 * Enhanced Inngest function: Send welcome email to new users with comprehensive error handling
 */
export const sendWelcomeEmail = inngestClient.createFunction(
  {
    id: 'send-welcome-email',
    name: 'Send Welcome Email',
    retries: 3,
    concurrency: 10,
    rateLimit: {
      limit: 50,
      period: '1m',
    },
  },
  { event: 'user/registered' },
  async ({ event, step, attempt }) => {
    const { userId, email, timestamp } = event.data;

    try {
      // Step 1: Validate input data
      await step.run('validate-input', async () => {
        if (!userId || !email) {
          throw new Error('Missing required fields: userId or email');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error(`Invalid email format: ${email}`);
        }

        return { valid: true, userId, email };
      });

      // Step 2: Check if user exists and get user details
      await step.run('fetch-user', async () => {
        const { data: user, error } = await supabaseClient
          .from('users')
          .select('id, email, created_at')
          .eq('id', userId)
          .single();

        if (error || !user) {
          throw new Error(`User not found: ${error?.message || 'Unknown user'}`);
        }

        return user;
      });

      // Step 3: Log welcome email attempt in audit trail
      await step.run('log-welcome-attempt', async () => {
        try {
          await auditService.logEvent({
            action: 'WELCOME_EMAIL_SENT',
            userId,
            userRole: 'user',
            details: {
              email,
              timestamp,
              attempt: attempt || 1,
            },
          });
          return { logged: true };
        } catch (auditError) {
          console.warn('Audit logging failed, continuing:', auditError);
          // Don't fail the entire workflow if audit logging fails
          return { logged: false, reason: (auditError as Error).message };
        }
      });

      // Step 4: Send welcome email (mock implementation - replace with real service)
      const emailResult = await step.run('send-email', async () => {
        // In production, integrate with your email service (SendGrid, Resend, AWS SES, etc.)
        console.log(`📧 WELCOME EMAIL: Sending to ${email} for user ${userId}`);

        // Example integration with real service:
        // const result = await emailService.send({
        //   to: email,
        //   subject: 'Welcome to Wildout!',
        //   template: 'welcome',
        //   data: { userId, email, signupDate: userData.created_at }
        // });

        // Simulate email service response
        return {
          sent: true,
          provider: 'mock',
          messageId: `welcome_${userId}_${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
      });

      // Step 5: Update user profile with welcome email status
      await step.run('update-user-profile', async () => {
        const { error } = await supabaseClient
          .from('user_profiles')
          .update({
            welcome_email_sent: true,
            welcome_email_sent_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.warn('Profile update failed:', error.message);
          // Non-critical, don't throw
          return { updated: false, reason: error.message };
        }

        return { updated: true };
      });

      return {
        userId,
        email,
        status: 'sent',
        messageId: emailResult.messageId,
        timestamp: emailResult.timestamp,
      };
    } catch (error) {
      // Enhanced error logging with context
      const errorDetails = {
        userId,
        email,
        timestamp,
        attempt: attempt || 1,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };

      console.error('Welcome email workflow failed:', errorDetails);

      // Log failure to audit trail
      await step.run('log-failure', async () => {
        try {
          await auditService.logEvent({
            action: 'WELCOME_EMAIL_FAILED',
            userId,
            details: errorDetails,
          });
        } catch (auditError) {
          console.error('Failed to log workflow failure:', (auditError as Error).message);
        }
        return { logged: true };
      });

      // Re-throw for retry logic
      throw error;
    }
  }
);

/**
 * Enhanced Inngest function: Process event creation with validation, notifications, and error handling
 */
export const processNewEvent = inngestClient.createFunction(
  {
    id: 'process-new-event',
    name: 'Process New Event Creation',
    retries: 2,
    concurrency: 5,
    rateLimit: {
      limit: 30,
      period: '1m',
    },
  },
  { event: 'event/created' },
  async ({ event, step, attempt }) => {
    const { eventId, title, createdBy } = event.data;

    try {
      // Step 1: Validate event data exists and is complete
      const eventDetails = await step.run('validate-event', async () => {
        const { data: event, error } = await supabaseClient
          .from('events')
          .select(`
            *,
            venues!inner(name, location),
            team_members!inner(name, email),
            event_media!left(*)
          `)
          .eq('id', eventId)
          .single();

        if (error || !event) {
          throw new Error(`Event validation failed: ${error?.message || 'Event not found'}`);
        }

        // Validate required fields
        const requiredFields = ['title', 'date', 'venue_id'];
        const missingFields = requiredFields.filter(field => !event[field]);

        if (missingFields.length > 0) {
          throw new Error(`Event missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate date is in the future
        const eventDate = new Date(event.date);
        if (eventDate < new Date()) {
          throw new Error('Event date must be in the future');
        }

        return event;
      });

      // Step 2: Log event creation to audit trail
      await step.run('log-event-creation', async () => {
        try {
          await auditService.logContentAction(
            createdBy,
            'admin',
            'CREATE',
            'EVENT',
            eventId,
            {
              title,
              venue: eventDetails.venues?.name,
              date: eventDetails.date,
              teamMembers: eventDetails.team_members?.length || 0,
            }
          );
          return { logged: true };
        } catch (auditError) {
          console.warn('Audit logging failed, continuing:', auditError);
          return { logged: false, reason: (auditError as Error).message };
        }
      });

      // Step 3: Send notifications to admins and subscribers
      const notificationResult = await step.run('send-notifications', async () => {
        console.log(`📢 NEW EVENT: "${title}" created by ${createdBy}`);

        // Example notification channels
        const notifications: Array<{
          channel: string;
          status: string;
          message?: string;
          recipients?: string[];
          subject?: string;
        }> = [];

        // Admin dashboard notification
        notifications.push({
          channel: 'admin-dashboard',
          status: 'pending',
          message: `New event created: ${title}`,
        });

        // Email notification (mock - replace with real service)
        // In production, this would send emails to admin team
        notifications.push({
          channel: 'email',
          status: 'sent',
          recipients: ['admin@wildout.com'],
          subject: `New Event: ${title}`,
        });

        // You could also:
        // - Send Slack webhook
        // - Update social media
        // - Create calendar events
        // - Notify subscribers via push notifications

        return {
          notifications,
          eventTitle: title,
          venue: eventDetails.venues?.name,
        };
      });

      // Step 4: Update event status and metadata
      await step.run('update-event-status', async () => {
        const { error } = await supabaseClient
          .from('events')
          .update({
            status: 'published',
            processed_at: new Date().toISOString(),
            processed_by: createdBy,
          })
          .eq('id', eventId);

        if (error) {
          throw new Error(`Failed to update event status: ${error.message}`);
        }

        return { updated: true };
      });

      // Step 5: Create system notification for event creators
      await step.run('notify-creator', async () => {
        // This could create a notification in the user's notification center
        console.log(`📧 CREATOR NOTIFICATION: Event "${title}" is now live`);

        return {
          notified: true,
          recipient: createdBy,
          message: `Your event "${title}" has been published and is now live!`,
        };
      });

      return {
        eventId,
        title,
        venue: eventDetails.venues?.name,
        status: 'processed',
        notifications: notificationResult.notifications.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Enhanced error logging with context
      const errorDetails = {
        eventId,
        title,
        createdBy,
        attempt: attempt || 1,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };

      console.error('Event creation workflow failed:', errorDetails);

      // Log failure to audit trail
      await step.run('log-failure', async () => {
        try {
          await auditService.logContentAction(
            createdBy,
            'admin',
            'CREATE',
            'EVENT',
            eventId,
            {
              title,
              status: 'FAILED',
              error: errorDetails.error,
            }
          );
        } catch (auditError) {
          console.error('Failed to log workflow failure:', (auditError as Error).message);
        }
        return { logged: true };
      });

      // Re-throw for retry logic
      throw error;
    }
  }
);

/**
 * Enhanced Inngest function: Audit log processor with security monitoring and analytics
 */
export const processAuditLog = inngestClient.createFunction(
  {
    id: 'process-audit-log',
    name: 'Process Audit Log Entry',
    retries: 5, // Higher retries for audit logging (critical)
    concurrency: 20,
    rateLimit: {
      limit: 200,
      period: '1m',
    },
  },
  { event: 'audit/log' },
  async ({ event, step, attempt }) => {
    const { action, userId, details } = event.data;

    try {
      // Step 1: Validate audit log data
      await step.run('validate-audit-data', async () => {
        if (!action || !userId) {
          throw new Error('Missing required audit fields: action or userId');
        }

        // Validate action format
        if (typeof action !== 'string' || action.length > 100) {
          throw new Error('Invalid action format');
        }

        return { valid: true, action, userId };
      });

      // Step 2: Store audit log in Supabase with enhanced data
      const logEntry = await step.run('store-audit-log', async () => {
        const { data, error } = await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: userId,
            action: action,
            details: {
              ...details,
              processed_at: new Date().toISOString(),
              attempt: attempt || 1,
            },
            timestamp: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to store audit log: ${error.message}`);
        }

        return data;
      });

      // Step 3: Real-time security monitoring and anomaly detection
      await step.run('security-monitoring', async () => {
        const securityChecks: Array<{
          type: string;
          severity: string;
          attempts?: number;
          userId?: string;
          action?: string;
          count?: number;
        }> = [];

        // Check for multiple failed login attempts
        if (action === 'LOGIN_FAILURE') {
          const { data: recentFailures } = await supabaseClient
            .from('audit_logs')
            .select('id, timestamp')
            .eq('action', 'LOGIN_FAILURE')
            .eq('user_id', userId)
            .gt('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString())
            .limit(5);

          if (recentFailures && recentFailures.length >= 3) {
            securityChecks.push({
              type: 'MULTIPLE_FAILED_LOGINS',
              severity: 'HIGH',
              attempts: recentFailures.length,
              userId,
            });

            console.log(`🚨 SECURITY ALERT: ${recentFailures.length} failed logins for user ${userId}`);

            // Trigger security alert workflow
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

        // Check for privilege escalation attempts
        if (action.includes('PERMISSION_DENIED') || action.includes('UNAUTHORIZED')) {
          securityChecks.push({
            type: 'PERMISSION_VIOLATION',
            severity: 'MEDIUM',
            action,
            userId,
          });
        }

        // Check for bulk operations (potential data exfiltration)
        if (action.includes('BULK_') || details?.count > 100) {
          securityChecks.push({
            type: 'BULK_OPERATION',
            severity: 'LOW',
            action,
            count: details?.count,
            userId,
          });
        }

        return {
          monitored: true,
          checks: securityChecks,
          hasSecurityIssues: securityChecks.length > 0,
        };
      });

      // Step 4: Compliance and retention management
      await step.run('compliance-check', async () => {
        // Check if this action requires special compliance handling
        const complianceActions = [
          'DATA_EXPORT',
          'USER_DELETE',
          'ROLE_CHANGE',
          'SETTINGS_CHANGE',
        ];

        if (complianceActions.includes(action)) {
          // Log to compliance tracking system
          console.log(`📋 COMPLIANCE: ${action} by ${userId} - ${JSON.stringify(details)}`);

          return {
            compliance: true,
            action,
            requiresReview: true,
          };
        }

        return { compliance: false };
      });

      // Step 5: Analytics and metrics aggregation
      await step.run('update-analytics', async () => {
        // Update user activity metrics
        const { error } = await supabaseClient
          .from('user_activity_metrics')
          .upsert({
            user_id: userId,
            last_action: action,
            last_action_at: new Date().toISOString(),
            action_count: 1,
          }, {
            onConflict: 'user_id',
          });

        if (error) {
          console.warn('Analytics update failed:', error.message);
          // Non-critical, don't throw
          return { updated: false };
        }

        return { updated: true };
      });

      return {
        logId: logEntry.id,
        action,
        userId,
        status: 'logged',
        timestamp: logEntry.timestamp,
      };
    } catch (error) {
      // Critical: Audit logging failures must be handled carefully
      const errorDetails = {
        action,
        userId,
        details,
        attempt: attempt || 1,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };

      console.error('Audit log processing failed:', errorDetails);

      // Emergency fallback logging
      if (attempt >= 3) {
        await step.run('emergency-logging', async () => {
          // Write to fallback log (file, external service, etc.)
          console.error('EMERGENCY AUDIT LOG:', JSON.stringify(errorDetails));
          return { emergencyLogged: true };
        });
      }

      // Re-throw for retry (audit logs are critical)
      throw error;
    }
  }
);

/**
 * Enhanced Inngest function: Batch email processor with rate limiting and error handling
 */
export const batchEmailProcessor = inngestClient.createFunction(
  {
    id: 'batch-email-processor',
    name: 'Batch Email Processor',
    retries: 3,
    concurrency: 5, // Limit concurrent executions to prevent overwhelming email service
    rateLimit: {
      limit: 100, // Max 100 events per minute
      period: '1m',
    },
  },
  { event: 'email/send' },
  async ({ event, step, attempt }) => {
    const { to, subject, body } = event.data;

    try {
      // Step 1: Validate email format and data
      await step.run('validate-email', async () => {
        if (!to || !subject || !body) {
          throw new Error('Missing required fields: to, subject, or body');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
          throw new Error(`Invalid email format: ${to}`);
        }

        // Validate subject length
        if (subject.length > 200) {
          throw new Error('Subject too long (max 200 characters)');
        }

        return { valid: true, to, subject };
      });

      // Step 2: Check email rate limiting per recipient
      await step.run('check-rate-limit', async () => {
        const { data: recentEmails } = await supabaseClient
          .from('email_log')
          .select('id, timestamp')
          .eq('recipient', to)
          .gt('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
          .limit(10);

        if (recentEmails && recentEmails.length >= 10) {
          throw new Error(`Rate limit exceeded for ${to}: ${recentEmails.length} emails in last hour`);
        }

        return { allowed: true, recentCount: recentEmails?.length || 0 };
      });

      // Step 3: Send email (mock implementation - replace with real service)
      const emailResult = await step.run('send-email', async () => {
        console.log(`📧 EMAIL: ${subject} → ${to}`);

        // In production, integrate with real email service:
        // const result = await emailService.send({
        //   to,
        //   subject,
        //   html: body,
        //   from: 'noreply@wildout.com'
        // });

        // Simulate email service response
        return {
          sent: true,
          messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          provider: 'mock',
          timestamp: new Date().toISOString(),
        };
      });

      // Step 4: Log email activity to audit trail
      await step.run('log-email-activity', async () => {
        try {
          await auditService.logEvent({
            action: 'EMAIL_SENT',
            details: {
              to,
              subject,
              messageId: emailResult.messageId,
              provider: emailResult.provider,
              attempt: attempt || 1,
            },
          });

          // Also log to email log table for rate limiting
          await supabaseClient
            .from('email_log')
            .insert({
              recipient: to,
              subject,
              message_id: emailResult.messageId,
              timestamp: new Date().toISOString(),
            });

          return { logged: true };
        } catch (auditError) {
          console.warn('Email activity logging failed:', (auditError as Error).message);
          return { logged: false, reason: (auditError as Error).message };
        }
      });

      // Step 5: Update email metrics
      await step.run('update-metrics', async () => {
        const { error } = await supabaseClient
          .from('email_metrics')
          .upsert({
            date: new Date().toISOString().split('T')[0],
            sent_count: 1,
            last_sent_at: new Date().toISOString(),
          }, {
            onConflict: 'date',
          });

        if (error) {
          console.warn('Metrics update failed:', error.message);
          return { updated: false };
        }

        return { updated: true };
      });

      return {
        to,
        subject,
        status: 'delivered',
        messageId: emailResult.messageId,
        timestamp: emailResult.timestamp,
      };
    } catch (error) {
      // Enhanced error logging
      const errorDetails = {
        to,
        subject,
        attempt: attempt || 1,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };

      console.error('Email processing failed:', errorDetails);

      // Log failure to audit trail
      await step.run('log-failure', async () => {
        try {
          await auditService.logEvent({
            action: 'EMAIL_FAILED',
            details: errorDetails,
          });
        } catch (auditError) {
          console.error('Failed to log email failure:', (auditError as Error).message);
        }
        return { logged: true };
      });

      // Re-throw for retry logic
      throw error;
    }
  }
);

// Export all functions as an array for easy registration
export const inngestFunctions = [
  sendWelcomeEmail,
  processNewEvent,
  processAuditLog,
  batchEmailProcessor,
];