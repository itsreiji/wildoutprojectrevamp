import { Inngest } from 'inngest';

// Create Inngest client
export const inngest = new Inngest({
  id: 'wildout-project',
  eventKey: import.meta.env.VITE_INNGEST_EVENT_KEY || import.meta.env.INNGEST_EVENT_KEY,
  // For local development with Inngest dev server
  baseUrl: import.meta.env.VITE_INNGEST_DEV_SERVER_URL || import.meta.env.INNGEST_DEV_SERVER_URL,
});

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
};

// Export typed Inngest client
export const inngestClient = new Inngest({
  id: 'wildout-project',
  eventKey: import.meta.env.VITE_INNGEST_EVENT_KEY || import.meta.env.INNGEST_EVENT_KEY,
  baseUrl: import.meta.env.VITE_INNGEST_DEV_SERVER_URL || import.meta.env.INNGEST_DEV_SERVER_URL,
});