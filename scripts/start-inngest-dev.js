#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Development script to start Inngest alongside Vite
 * This script helps you run the Inngest dev server for local development
 */

const { spawn } = require('child_process');

console.log('🚀 Starting Inngest Development Environment...\n');

// Check if Inngest CLI is installed
const checkInngest = () => {
  return new Promise((resolve) => {
    const check = spawn('npx', ['inngest', '--version'], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    check.stdout.on('data', (data) => output += data.toString());
    check.stderr.on('data', (data) => output += data.toString());

    check.on('close', (code) => {
      resolve(code === 0);
    });
  });
};

// Start Inngest dev server
const startInngest = () => {
  console.log('📦 Starting Inngest dev server on http://127.0.0.1:8288');

  const inngestProcess = spawn('npx', ['inngest', 'dev', '-u', 'http://localhost:5173'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '8288' }
  });

  inngestProcess.on('error', (error) => {
    console.error('❌ Failed to start Inngest:', error.message);
  });

  return inngestProcess;
};

// Start Vite dev server
const startVite = () => {
  console.log('🌐 Starting Vite dev server on http://localhost:5173');

  const viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  viteProcess.on('error', (error) => {
    console.error('❌ Failed to start Vite:', error.message);
  });

  return viteProcess;
};

// Main execution
async function main() {
  const hasInngest = await checkInngest();

  if (!hasInngest) {
    console.log('⚠️  Inngest CLI not found. Installing...');
    const install = spawn('npm', ['install', '-g', 'inngest@latest'], {
      stdio: 'inherit',
      shell: true
    });

    install.on('close', async (code) => {
      if (code === 0) {
        console.log('✅ Inngest CLI installed successfully\n');
        startServers();
      } else {
        console.error('❌ Failed to install Inngest CLI');
        process.exit(1);
      }
    });
  } else {
    startServers();
  }
}

function startServers() {
  console.log('\n📝 Configuration:');
  console.log('   - Vite: http://localhost:5173');
  console.log('   - Inngest Dev Server: http://127.0.0.1:8288');
  console.log('   - Inngest API: http://localhost:5173/api/inngest (proxied to dev server)');
  console.log('\n🔧 Make sure your .env file has:');
  console.log('   VITE_INNGEST_DEV_SERVER_URL=http://localhost:5173');
  console.log('   INNGEST_DEV_SERVER_URL=http://127.0.0.1:8288');
  console.log('\nPress Ctrl+C to stop all servers\n');

  const inngest = startInngest();
  const vite = startVite();

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    inngest.kill();
    vite.kill();
    process.exit(0);
  });

  // Restart servers if they crash
  inngest.on('exit', (code) => {
    if (code !== 0) {
      console.log('⚠️  Inngest server crashed, restarting...');
      setTimeout(() => startServers(), 2000);
    }
  });

  vite.on('exit', (code) => {
    if (code !== 0) {
      console.log('⚠️  Vite server crashed, restarting...');
      setTimeout(() => startServers(), 2000);
    }
  });
}

main().catch(console.error);