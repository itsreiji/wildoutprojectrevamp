/**
 * Inngest API Endpoint for Vercel Production Deployment
 * 
 * This file creates a serverless function that handles Inngest webhook events
 * for production deployment on Vercel.
 */

import { serve } from 'inngest/edge';
import { Inngest } from 'inngest';

// Import all Inngest functions from the main application
import { inngestFunctions } from '../src/lib/inngest/functions';
import { inngestIntegrations } from '../src/lib/inngest/integrations';

// Production configuration
const getProductionConfig = () => {
  // In production, we need to read from Vercel environment variables
  const eventKey = process.env.VITE_INNGEST_EVENT_KEY || process.env.INNGEST_EVENT_KEY;
  const appId = process.env.VITE_INNGEST_APP_ID || process.env.INNGEST_APP_ID || 'wildout-production';
  
  if (!eventKey) {
    console.warn('⚠️  INNGEST_EVENT_KEY not set - using development mode');
  }

  return {
    appId,
    eventKey: eventKey || 'dev',
    baseUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  };
};

// Initialize Inngest client for production
const config = getProductionConfig();

console.log('🚀 Inngest Production API Initializing...');
console.log('📋 App ID:', config.appId);
console.log('🔑 Event Key:', config.eventKey ? '✅ Set' : '❌ Missing');
console.log('🌐 Base URL:', config.baseUrl);
console.log('📊 Functions:', inngestFunctions.length);
console.log('🔄 Integrations:', inngestIntegrations.length);

const inngestClient = new Inngest({
  id: config.appId,
  eventKey: config.eventKey,
  baseUrl: config.baseUrl,
});

// Combine all functions
const allFunctions = [...inngestFunctions, ...inngestIntegrations];

console.log('✅ Total functions registered:', allFunctions.length);

// Create the Inngest handler
const handler = serve({
  client: inngestClient,
  functions: allFunctions,
});

// Vercel serverless function export
export default async function inngestApi(req: Request): Promise<Response> {
  try {
    console.log(`📥 ${req.method} ${req.url}`);
    
    // Add security headers
    const headers = new Headers(req.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    
    // Create a new request with security headers
    const secureRequest = new Request(req.url, {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    // Handle the request
    const response = await handler(secureRequest);
    
    // Add security headers to response
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    console.log(`📤 ${response.status} ${response.statusText}`);
    return response;
    
  } catch (error) {
    console.error('❌ Inngest API Error:', error);
    
    // Return proper error response
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }
}

// Export for Vercel
export { handler };

// Health check endpoint for monitoring
export async function healthCheck(): Promise<Response> {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      functions: allFunctions.length,
      appId: config.appId,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}