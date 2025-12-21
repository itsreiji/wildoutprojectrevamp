#!/usr/bin/env node

import { spawn } from 'child_process';
import { createServer } from 'http';
import { setTimeout } from 'timers';
import { fetch } from 'undici';

const PORT = 8288;
const VITE_URL = 'http://localhost:5173/api/inngest';

console.log('🚀 Starting Inngest Dev Server...');

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Function to wait for a URL to be available
function waitForUrl(url, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = async () => {
      attempts++;
      try {
        const response = await fetch(url);
        if (response.ok) {
          console.log(`✅ ${url} is ready`);
          resolve(true);
          return;
        }
      } catch {
        // URL not ready yet
      }

      if (attempts >= maxAttempts) {
        reject(new Error(`Timeout waiting for ${url}`));
        return;
      }

      setTimeout(check, 1000);
    };

    check();
  });
}

async function main() {
  // Check if port is available
  const portAvailable = await isPortAvailable(PORT);
  if (!portAvailable) {
    console.log(`⚠️  Port ${PORT} is already in use. Trying to stop existing process...`);
    // You might want to add logic to kill the existing process here
    console.log('Please stop any existing Inngest dev server and try again.');
    process.exit(1);
  }

  // Start the Inngest dev server
  // Use npx with the latest version
  const inngestProcess = spawn('npx', [
    'inngest-cli@latest',
    'dev',
    '-u',
    VITE_URL,
    '--port',
    PORT.toString(),
  ], {
    stdio: 'pipe',
    shell: true,
  });

  // Handle process output
  inngestProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Inngest dev server running')) {
      console.log('✅ Inngest dev server started successfully');
    }
    if (output.includes('error') || output.includes('Error')) {
      console.error('❌ Error:', output);
    }
    process.stdout.write(output);
  });

  inngestProcess.stderr.on('data', (data) => {
    console.error('STDERR:', data.toString());
  });

  inngestProcess.on('close', (code) => {
    console.log(`Inngest dev server exited with code ${code}`);
    process.exit(code);
  });

  inngestProcess.on('error', (error) => {
    console.error('Failed to start Inngest dev server:', error);
    process.exit(1);
  });

  // Wait for the server to be ready
  try {
    await waitForUrl(`http://localhost:${PORT}`, 30);
    console.log(`🎉 Inngest dev server is running at http://localhost:${PORT}`);
    console.log(`🔗 Inngest API: ${VITE_URL}`);
    console.log('📋 Check the dashboard at http://localhost:8288');
  } catch (error) {
    console.error('❌ Failed to start Inngest dev server:', error.message);
    inngestProcess.kill();
    process.exit(1);
  }
}

main().catch(console.error);