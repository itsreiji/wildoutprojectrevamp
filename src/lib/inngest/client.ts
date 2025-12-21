import { Inngest } from 'inngest';

// Define common event types for type safety
export type WildoutEvents = {
  'user/registered': {
    userId: string;
    email: string;
    timestamp: number;
  };
  'event/created': {
    eventId: string;
    title: string;
    createdBy: string;
  };
  'audit/log': {
    action: string;
    userId: string;
    details: Record<string, any>;
  };
  'email/send': {
    to: string;
    subject: string;
    body: string;
  };
  'security/alert': {
    type: string;
    userId: string;
    attempts: number;
    timestamp: number;
  };
  'system/maintenance': {
    task: string;
  };
};

// Create Inngest client with proper configuration
export const inngest = new Inngest({
  id: 'wildout-project',
  eventKey: import.meta.env.VITE_INNGEST_EVENT_KEY || 'dev',
  baseUrl: import.meta.env.VITE_INNGEST_DEV_SERVER_URL || 'http://localhost:5173',
});

// Export typed Inngest client
export const inngestClient = inngest;