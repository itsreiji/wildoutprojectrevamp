import { inngestClient } from './client';
import { supabaseClient } from '../../supabase/client';

/**
 * Example Inngest function: Send welcome email to new users
 */
export const sendWelcomeEmail = inngestClient.createFunction(
  {
    id: 'send-welcome-email',
    name: 'Send Welcome Email',
  },
  { event: 'user/registered' },
  async ({ event, step }) => {
    const { userId, email } = event.data;

    // Step 1: Log the welcome email attempt
    await step.run('log-welcome-attempt', async () => {
      console.log(`Sending welcome email to ${email} for user ${userId}`);

      // You could add audit logging here using your existing audit service
      // await auditService.logAction(userId, 'welcome_email_sent', { email });

      return { success: true, email };
    });

    // Step 2: Simulate email sending (replace with actual email service)
    await step.run('send-email', async () => {
      // In production, integrate with your email service (SendGrid, Resend, etc.)
      console.log(`[MOCK] Email sent to ${email}: Welcome to Wildout!`);

      return {
        sent: true,
        provider: 'mock',
        timestamp: new Date().toISOString(),
      };
    });

    return {
      userId,
      email,
      status: 'sent',
    };
  }
);

/**
 * Example Inngest function: Process event creation and notify admins
 */
export const processNewEvent = inngestClient.createFunction(
  {
    id: 'process-new-event',
    name: 'Process New Event Creation',
  },
  { event: 'event/created' },
  async ({ event, step }) => {
    const { eventId, title, createdBy } = event.data;

    // Step 1: Validate event data
    const validatedEvent = await step.run('validate-event', async () => {
      const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch event: ${error.message}`);
      }

      return data;
    });

    // Step 2: Send notification to admins
    await step.run('notify-admins', async () => {
      console.log(`New event created: "${title}" by ${createdBy}`);

      // You could send notifications via:
      // - Slack webhook
      // - Email to admin team
      // - Push notification
      // - Database notification record

      return {
        notified: true,
        channels: ['admin-dashboard', 'email'],
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
 * Example Inngest function: Audit log processor
 */
export const processAuditLog = inngestClient.createFunction(
  {
    id: 'process-audit-log',
    name: 'Process Audit Log Entry',
  },
  { event: 'audit/log' },
  async ({ event, step }) => {
    const { action, userId, details } = event.data;

    // Step 1: Store audit log in Supabase
    const logEntry = await step.run('store-audit-log', async () => {
      const { data, error } = await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: action,
          details: details,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store audit log: ${error.message}`);
      }

      return data;
    });

    // Step 2: Check for suspicious activity (example)
    await step.run('security-check', async () => {
      // Add security monitoring logic here
      if (action.includes('failed_login')) {
        console.log(`Security alert: Failed login attempts for user ${userId}`);
        // Trigger security alert function
      }

      return { checked: true };
    });

    return {
      logId: logEntry.id,
      action,
      status: 'logged',
    };
  }
);

/**
 * Example Inngest function: Batch email processor
 */
export const batchEmailProcessor = inngestClient.createFunction(
  {
    id: 'batch-email-processor',
    name: 'Batch Email Processor',
  },
  { event: 'email/send' },
  async ({ event, step }) => {
    const { to, subject, body } = event.data;

    // Step 1: Validate email format
    await step.run('validate-email', async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        throw new Error(`Invalid email format: ${to}`);
      }
      return { valid: true };
    });

    // Step 2: Send email (mock implementation)
    await step.run('send-email-batch', async () => {
      console.log(`[BATCH EMAIL] To: ${to}, Subject: ${subject}`);
      // Integrate with your email service here

      return {
        sent: true,
        messageId: `msg_${Date.now()}`,
      };
    });

    return {
      recipient: to,
      subject,
      status: 'delivered',
    };
  }
);

// Export all functions as an array for easy registration
export const inngestFunctions = [
  sendWelcomeEmail,
  processNewEvent,
  processAuditLog,
  batchEmailProcessor,
];