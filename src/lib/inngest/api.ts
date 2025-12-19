/**
 * Inngest API Route Handler
 * 
 * This file provides the API endpoint for Inngest to communicate with your application.
 * You can use this with various server frameworks or as a serverless function.
 */

import { inngestHandler } from './server';

// Generic API handler that can be adapted to different frameworks
export async function handleInngestRequest(request: Request): Promise<Response> {
  try {
    // Use the Inngest handler to process the request
    const response = await inngestHandler(request);
    return response;
  } catch (error) {
    console.error('Inngest request handler error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Example: Express.js route handler
export function createInngestExpressRoute() {
  return async (req: any, res: any) => {
    try {
      const request = new Request(
        `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        {
          method: req.method,
          headers: new Headers(req.headers as Record<string, string>),
          body: req.body,
        }
      );

      const response = await handleInngestRequest(request);
      
      // Convert Response to Express response
      res.status(response.status);
      
      // Copy headers
      for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
      }
      
      // Send body
      const body = await response.text();
      res.send(body);
    } catch (error) {
      console.error('Express Inngest handler error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

// Example: Next.js route handler
export async function inngestNextRouteHandler(req: Request): Promise<Response> {
  return handleInngestRequest(req);
}

// Example: Hono route handler (since you have Hono in your dependencies)
export function createInngestHonoRoute() {
  return async (c: any) => {
    const request = c.req.raw;
    return handleInngestRequest(request);
  };
}