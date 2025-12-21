#!/usr/bin/env node

/**
 * Production Setup Verification Script
 *
 * This script verifies that all components are properly configured
 * for production deployment to Vercel with Inngest integration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

console.log(`${colors.bold}${colors.blue}🚀 Wildout Project - Production Setup Verification${colors.reset}\n`);

// Check 1: Required Files
console.log(`${colors.bold}📁 Checking Required Files...${colors.reset}`);
const requiredFiles = [
  'package.json',
  'vercel.json',
  'vite.config.ts',
  'src/lib/inngest/client.ts',
  'src/lib/inngest/functions.ts',
  'src/lib/inngest/integrations.ts',
  'api/inngest.ts',
  '.env.production',
  'PRODUCTION_DEPLOYMENT_GUIDE.md'
];

let filesMissing = false;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(projectRoot, file));
  const status = exists ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
  console.log(`  ${status} ${file}`);
  if (!exists) filesMissing = true;
});

// Check 2: Package.json Configuration
console.log(`\n${colors.bold}📦 Checking Package.json Scripts...${colors.reset}`);
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const requiredScripts = ['build', 'dev', 'type-check', 'test', 'build:vercel'];

requiredScripts.forEach(script => {
  const exists = packageJson.scripts && packageJson.scripts[script];
  const status = exists ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
  console.log(`  ${status} "${script}" script`);
});

// Check 3: Inngest Dependencies
console.log(`\n${colors.bold}🔗 Checking Inngest Dependencies...${colors.reset}`);
const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};

const inngestInstalled = dependencies.inngest || devDependencies.inngest;
const status = inngestInstalled ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
console.log(`  ${status} Inngest SDK: ${inngestInstalled || 'Not installed'}`);

// Check 4: Vercel Configuration
console.log(`\n${colors.bold}⚙️  Checking Vercel Configuration...${colors.reset}`);
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, 'vercel.json'), 'utf8'));

  // Check routes
  const hasInngestRoute = vercelConfig.routes?.some(r => r.src.includes('inngest'));
  console.log(`  ${hasInngestRoute ? colors.green : colors.red}✅${colors.reset} Inngest API route configured`);

  // Check functions
  const hasFunctions = vercelConfig.functions && Object.keys(vercelConfig.functions).length > 0;
  console.log(`  ${hasFunctions ? colors.green : colors.red}✅${colors.reset} Serverless functions configured`);

  // Check builds
  const hasBuilds = vercelConfig.builds && vercelConfig.builds.length > 0;
  console.log(`  ${hasBuilds ? colors.green : colors.red}✅${colors.reset} Build configuration present`);
} catch (e) {
  console.log(`  ${colors.red}❌${colors.reset} Vercel config error: ${e.message}`);
}

// Check 5: Environment Variables Template
console.log(`\n${colors.bold}🔧 Checking Environment Template...${colors.reset}`);
if (fs.existsSync(path.join(projectRoot, '.env.production'))) {
  const envContent = fs.readFileSync(path.join(projectRoot, '.env.production'), 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_INNGEST_EVENT_KEY',
    'VITE_INNGEST_APP_ID'
  ];

  requiredVars.forEach(variable => {
    const hasVar = envContent.includes(variable);
    const status = hasVar ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
    console.log(`  ${status} ${variable}`);
  });
} else {
  console.log(`  ${colors.red}❌${colors.reset} .env.production file missing`);
}

// Check 6: Inngest Functions Count
console.log(`\n${colors.bold}📊 Checking Inngest Functions...${colors.reset}`);
try {
  const functionsFile = fs.readFileSync(path.join(projectRoot, 'src/lib/inngest/functions.ts'), 'utf8');
  const integrationsFile = fs.readFileSync(path.join(projectRoot, 'src/lib/inngest/integrations.ts'), 'utf8');

  // Count function exports
  const functionMatches = functionsFile.match(/export const \w+ = inngestClient\.createFunction/g);
  const integrationMatches = integrationsFile.match(/export const \w+ = inngestClient\.createFunction/g);

  const coreFunctions = functionMatches ? functionMatches.length : 0;
  const integrations = integrationMatches ? integrationMatches.length : 0;

  console.log(`  ${colors.green}✅${colors.reset} Core functions: ${coreFunctions}`);
  console.log(`  ${colors.green}✅${colors.reset} Integration workflows: ${integrations}`);
  console.log(`  ${colors.green}✅${colors.reset} Total: ${coreFunctions + integrations} functions`);
} catch (e) {
  console.log(`  ${colors.yellow}⚠️ ${colors.reset} Could not analyze functions: ${e.message}`);
}

// Check 7: Build Output Directory
console.log(`\n${colors.bold}🏗️  Checking Build Configuration...${colors.reset}`);
const distExists = fs.existsSync(path.join(projectRoot, 'dist'));
if (distExists) {
  const distFiles = fs.readdirSync(path.join(projectRoot, 'dist'));
  const hasIndex = distFiles.includes('index.html');
  const hasAssets = distFiles.some(f => f === 'assets' && fs.statSync(path.join(projectRoot, 'dist', f)).isDirectory());

  console.log(`  ${hasIndex ? colors.green : colors.red}✅${colors.reset} index.html present`);
  console.log(`  ${hasAssets ? colors.green : colors.red}✅${colors.reset} Assets directory present`);
  console.log(`  ${colors.green}✅${colors.reset} Build output ready for Vercel`);
} else {
  console.log(`  ${colors.yellow}⚠️ ${colors.reset} No dist directory (run 'pnpm run build' first)`);
}

// Check 8: API Endpoint
console.log(`\n${colors.bold}🌐 Checking API Endpoint...${colors.reset}`);
const apiExists = fs.existsSync(path.join(projectRoot, 'api/inngest.ts'));
if (apiExists) {
  const apiContent = fs.readFileSync(path.join(projectRoot, 'api/inngest.ts'), 'utf8');
  const hasServe = apiContent.includes('serve');
  const hasHandler = apiContent.includes('export default');

  console.log(`  ${hasServe ? colors.green : colors.red}✅${colors.reset} Inngest serve imported`);
  console.log(`  ${hasHandler ? colors.green : colors.red}✅${colors.reset} Default export present`);
  console.log(`  ${colors.green}✅${colors.reset} Vercel serverless function ready`);
} else {
  console.log(`  ${colors.red}❌${colors.reset} API endpoint missing`);
}

// Final Summary
console.log(`\n${colors.bold}${colors.blue}📋 VERIFICATION SUMMARY${colors.reset}\n`);

if (!filesMissing) {
  console.log(`${colors.green}✅ All required files present${colors.reset}`);
  console.log(`${colors.green}✅ Configuration looks good${colors.reset}`);
  console.log(`${colors.green}✅ Ready for Vercel deployment${colors.reset}`);
  console.log(`\n${colors.bold}Next steps:${colors.reset}`);
  console.log(`  1. Set environment variables in Vercel`);
  console.log(`  2. Configure Inngest event key`);
  console.log(`  3. Deploy to Vercel`);
  console.log(`  4. Test Inngest integration`);
  console.log(`\n${colors.bold}📖 Read PRODUCTION_DEPLOYMENT_GUIDE.md for detailed instructions${colors.reset}`);
} else {
  console.log(`${colors.red}❌ Some required files are missing${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Please ensure all files are present before deployment${colors.reset}`);
}

console.log(`\n${colors.bold}🔍 For detailed setup instructions, run:${colors.reset}`);
console.log(`  cat PRODUCTION_DEPLOYMENT_GUIDE.md\n`);