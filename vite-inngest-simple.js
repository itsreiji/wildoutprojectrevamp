/* global URL, Request, Headers */

// Simple standalone Inngest API handler for Vite
// This avoids import.meta.env issues by not importing the client file

import { Inngest } from 'inngest';
import { serve } from 'inngest/edge';

// Simple function definitions that don't depend on the client
const createFunctions = (inngestClient) => {
  return [
    inngestClient.createFunction(
      { id: 'send-welcome-email', name: 'Send Welcome Email' },
      { event: 'user/registered' },
      async ({ event }) => {
        console.log('📧 Welcome email function triggered:', event.data);
        return { success: true };
      }
    ),
    inngestClient.createFunction(
      { id: 'process-new-event', name: 'Process New Event' },
      { event: 'event/created' },
      async ({ event }) => {
        console.log('📅 Event processing triggered:', event.data);
        return { success: true };
      }
    ),
    inngestClient.createFunction(
      { id: 'process-audit-log', name: 'Process Audit Log' },
      { event: 'audit/log' },
      async ({ event }) => {
        console.log('📝 Audit log triggered:', event.data);
        return { success: true };
      }
    ),
  ];
};

export function inngestApiPlugin() {
  return {
    name: 'inngest-api-server',
    configureServer(server) {
      let inngestHandler = null;
      let isInitialized = false;

      // Handle both root and /api/inngest paths
      const handleInngestRequest = async (req, res) => {
        // Debug logging
        console.log('🔍 Incoming request:', req.method, req.url);
        console.log('🔍 Headers:', req.headers);

        try {
          // Initialize on first request
          if (!isInitialized) {
            console.log('🚀 Initializing Inngest API...');

            // Get event key from environment
            const eventKey = process.env.VITE_INNGEST_EVENT_KEY || process.env.INNGEST_EVENT_KEY || 'dev';

            // Create client
            const inngest = new Inngest({
              id: 'wildout-project',
              eventKey: eventKey,
              baseUrl: 'http://localhost:5173',
            });

            // Create functions
            const functions = createFunctions(inngest);

            // Create handler
            inngestHandler = serve({
              client: inngest,
              functions: functions,
            });

            isInitialized = true;
            console.log('✅ Inngest API initialized');
            console.log('📋 Functions loaded:', functions.length);
            console.log('🔧 Event Key:', eventKey ? '✅ Set' : '❌ Missing');
          }

          // Convert Node.js request to Web Request
          const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          console.log('🔍 Full URL:', url.href);

          // Read body for all requests
          let body = '';
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'GET') {
            // For GET requests, check if there's a query parameter for body
            if (req.method === 'GET' && url.searchParams.get('body')) {
              body = url.searchParams.get('body');
            } else {
              // For POST/PUT/PATCH, read the body
              for await (const chunk of req) {
                body += chunk;
              }
            }
          }
          console.log('🔍 Body:', body);

          // Create Request object
          const request = new Request(url, {
            method: req.method || 'GET',
            headers: new Headers(req.headers),
            body: body || undefined,
          });
          console.log('🔍 Web Request created:', request.method, request.url);

          // Call the handler
          if (!inngestHandler) {
            throw new Error('Inngest handler not initialized');
          }

          // The serve function from inngest/edge returns a function that handles Web Requests
          const response = await inngestHandler(request);

          // Send response
          res.statusCode = response.status;
          res.statusMessage = response.statusText;

          // Copy headers
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });

          // Send body
          const responseText = await response.text();
          res.end(responseText);

        } catch (error) {
          console.error('❌ Inngest API Error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          res.end(JSON.stringify({ error: errorMessage }));
        }
      };

      // Register middleware for Inngest API paths only
      // Don't intercept '/' to allow Vite to serve the main HTML page
      server.middlewares.use('/api/inngest', handleInngestRequest);
      server.middlewares.use('/.redwood/functions/inngest', handleInngestRequest);
    }
  };
}