/**
 * Inngest Setup Script
 *
 * This script helps you set up Inngest in your Wildout project.
 * Run this once to get everything configured.
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Setting up Inngest for Wildout Project...\n');

// 1. Check environment variables
const envPath = join(process.cwd(), '.env');

let envContent = '';
if (existsSync(envPath)) {
  envContent = readFileSync(envPath, 'utf-8');
} else {
  console.log('⚠️  No .env file found. Creating one...');
  envContent = '';
}

// Check if Inngest variables exist
const hasInngestKey = envContent.includes('INNGEST_EVENT_KEY');
const hasSigningKey = envContent.includes('INNGEST_SIGNING_KEY');

if (!hasInngestKey) {
  console.log('📝 Adding INNGEST_EVENT_KEY to .env (optional for local dev)');
  envContent += '\n# Inngest Configuration (optional for local development)\n';
  envContent += 'INNGEST_EVENT_KEY=\n';
}

if (!hasSigningKey) {
  console.log('📝 Adding INNGEST_SIGNING_KEY to .env (optional for local dev)');
  envContent += 'INNGEST_SIGNING_KEY=\n';
}

// Write updated .env
writeFileSync(envPath, envContent);
console.log('✅ Environment variables updated\n');

// 2. Create API route example
const apiDir = join(process.cwd(), 'src', 'pages', 'api');

if (!existsSync(apiDir)) {
  console.log('📁 Creating API directory...');
  // Note: This would need to be done manually in the actual project structure
  console.log('⚠️  Please create src/pages/api/ directory for API routes\n');
}

// 3. Show setup instructions
console.log('📋 SETUP INSTRUCTIONS:\n');

console.log('1. Install Inngest CLI (optional, for local development):');
console.log('   npm install -g inngest-cli');
console.log('   # or');
console.log('   brew install inngest\n');

console.log('2. Run Inngest dev server (if using CLI):');
console.log('   inngest dev\n');

console.log('3. Set up API route depending on your framework:\n');

console.log('   For Vite + Express (server.js):');
console.log('   ```javascript');
console.log('   import { createInngestExpressRoute } from "./src/lib/inngest/api";');
console.log('   app.use("/api/inngest", createInngestExpressRoute());');
console.log('   ```\n');

console.log('   For Serverless (api/inngest.ts):');
console.log('   ```typescript');
console.log('   import { handleInngestRequest } from "../src/lib/inngest/api";');
console.log('   export default async function handler(req: Request) {');
console.log('     return handleInngestRequest(req);');
console.log('   }');
console.log('   ```\n');

console.log('   For Hono (already in your dependencies):');
console.log('   ```typescript');
console.log('   import { createInngestHonoRoute } from "./src/lib/inngest/api";');
console.log('   app.all("/inngest", createInngestHonoRoute());');
console.log('   ```\n');

console.log('4. Usage Examples:\n');

console.log('   In your AuthContext:');
console.log('   ```typescript');
console.log('   import { inngestClient } from "@/lib/inngest";');
console.log('   ');
console.log('   // On successful registration:');
console.log('   await inngestClient.send({');
console.log('     name: "user/registered",');
console.log('     data: { userId: user.id, email: user.email, timestamp: Date.now() }');
console.log('   });');
console.log('   ```\n');

console.log('   In your React components:');
console.log('   ```typescript');
console.log('   import { useUserRegistration } from "@/lib/inngest";');
console.log('   ');
console.log('   function RegistrationForm() {');
console.log('     const { triggerWelcomeEmail } = useUserRegistration();');
console.log('     ');
console.log('     const handleRegister = async (email: string) => {');
console.log('       const user = await createUser(email);');
console.log('       await triggerWelcomeEmail(user.id, email);');
console.log('     };');
console.log('   }');
console.log('   ```\n');

console.log('5. Available Functions:');
console.log('   - sendWelcomeEmail: Sends welcome emails to new users');
console.log('   - processNewEvent: Validates and notifies about new events');
console.log('   - processAuditLog: Stores audit logs with security checks');
console.log('   - batchEmailProcessor: Handles email sending with rate limiting');
console.log('   - enhancedAuditLogger: Uses your existing auditService');
console.log('   - userRegistrationWorkflow: Complete registration flow');
console.log('   - eventCreationWorkflow: Event creation with notifications');
console.log('   - maintenanceWorkflow: Data cleanup and maintenance tasks\n');

console.log('6. Production Deployment:');
console.log('   - Get credentials from https://app.inngest.com');
console.log('   - Set INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY');
console.log('   - Deploy your API route');
console.log('   - Configure Inngest dashboard to point to your URL\n');

console.log('✅ Setup complete! Check src/lib/inngest/README.md for detailed docs.');
console.log('\n📚 Next steps:');
console.log('   1. Read the README.md for detailed documentation');
console.log('   2. Check examples.ts for practical integration patterns');
console.log('   3. Run "pnpm dev" and test your setup');
console.log('   4. Visit http://localhost:8288 (if using inngest dev)\n');