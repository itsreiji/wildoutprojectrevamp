import { Inngest } from 'inngest';

// Create Inngest client
export const inngest = new Inngest({
  id: 'wildout-project',
  // You can add your Inngest event key here if you have one
  // eventKey: process.env.INNGEST_EVENT_KEY,
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
});