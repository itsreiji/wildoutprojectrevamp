import { serve } from 'inngest/edge';
import { inngestClient } from './client';
import { inngestFunctions } from './functions';
import { inngestIntegrations } from './integrations';

// Combine all functions
const allFunctions = [...inngestFunctions, ...inngestIntegrations];

// Create the Inngest server handler
export const inngestHandler = serve({
  client: inngestClient,
  functions: allFunctions,
});

// Export for use in API routes
export default inngestHandler;