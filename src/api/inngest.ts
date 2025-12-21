import { serve } from 'inngest/edge';
import { inngest } from '../lib/inngest/client';
import { inngestFunctions } from '../lib/inngest/functions';
import { inngestIntegrations } from '../lib/inngest/integrations';

// Combine all functions
const allFunctions = [...inngestFunctions, ...inngestIntegrations];

console.log('🚀 Inngest API Endpoint Initializing...');
console.log('📋 Functions:', allFunctions.length);
console.log('📊 Core Functions:', inngestFunctions.length);
console.log('🔄 Integration Workflows:', inngestIntegrations.length);
console.log('🆔 App ID:', inngest.id);
console.log('🔗 Base URL: http://localhost:5173');

// Create the Inngest handler
const handler = serve({
  client: inngest,
  functions: allFunctions,
});

console.log('✅ Inngest API handler created successfully');

// Export for Vite dev server
export default handler;

// Also export as named for potential other uses
export { handler };