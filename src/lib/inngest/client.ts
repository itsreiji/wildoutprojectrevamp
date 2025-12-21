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

// Environment-aware configuration
const getInngestConfig = () => {
  // Check for production environment first
  const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
  
  // In production, use Vercel environment variables
  const eventKey = isProduction 
    ? (process.env.VITE_INNGEST_EVENT_KEY || process.env.INNGEST_EVENT_KEY)
    : (import.meta.env.VITE_INNGEST_EVENT_KEY || 'dev');
  
  const appId = isProduction
    ? (process.env.VITE_INNGEST_APP_ID || process.env.INNGEST_APP_ID || 'wildout-production')
    : (import.meta.env.VITE_INNGEST_APP_ID || 'wildout-dev');
  
  // Base URL for Inngest server
  let baseUrl: string;
  if (isProduction) {
    // In production, use the Vercel URL or custom domain
    baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.VITE_INNGEST_BASE_URL || 'https://your-app.vercel.app');
  } else {
    // In development, use local server
    baseUrl = import.meta.env.VITE_INNGEST_DEV_SERVER_URL || 'http://localhost:5173';
  }

  return {
    appId,
    eventKey: eventKey || 'dev',
    baseUrl,
    isProduction,
  };
};

const config = getInngestConfig();

// Log configuration (only in development to avoid exposing sensitive info)
if (!config.isProduction) {
  console.log('🔧 Inngest Client Config:', {
    appId: config.appId,
    eventKey: config.eventKey ? '✅ Set' : '❌ Missing',
    baseUrl: config.baseUrl,
    environment: config.isProduction ? 'production' : 'development',
  });
}

// Create Inngest client with proper configuration
export const inngest = new Inngest({
  id: config.appId,
  eventKey: config.eventKey,
  baseUrl: config.baseUrl,
});

// Export typed Inngest client
export const inngestClient = inngest;

// Export config for debugging (without sensitive values)
export const inngestConfig = {
  appId: config.appId,
  baseUrl: config.baseUrl,
  isProduction: config.isProduction,
  // Don't export eventKey for security
};