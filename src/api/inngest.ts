import { serve } from 'inngest/hono';
import { inngest } from '../lib/inngest/client';
import { inngestFunctions } from '../lib/inngest/functions';
import { inngestIntegrations } from '../lib/inngest/integrations';

// Combine all functions
const allFunctions = [...inngestFunctions, ...inngestIntegrations];

// Create the Inngest handler
const handler = serve({
  client: inngest,
  functions: allFunctions,
});

// Export for Vite dev server
export default handler;

// Also export as named for potential other uses
export { handler };