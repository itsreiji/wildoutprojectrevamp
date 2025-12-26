#!/usr/bin/env node

/**
 * Enhanced Development Server Startup Script
 * 
 * Features:
 * - Port 3000 availability checking
 * - Process verification for development servers
 * - Cross-platform compatibility (Windows, macOS, Linux)
 * - Clear messaging and error handling
 */

const { execSync, spawn } = require('child_process');
const net = require('net');
const os = require('os');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  dim: '\x1b[2m'
};

class DevServerManager {
  constructor() {
    this.port = 3000;
    this.platform = os.platform();
    this.processInfo = null;
  }

  /**
   * Check if a port is currently in use
   * @returns {Promise<boolean>} - True if port is occupied
   */
  async isPortInUse() {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve(false);
      });

      server.listen(this.port);
    });
  }

  /**
   * Get process information for a given port
   * @returns {Promise<Object|null>} - Process info or null
   */
  async getProcessInfo() {
    try {
      let command;
      
      if (this.platform === 'win32') {
        // Windows: Use netstat to find process using port
        command = `netstat -ano | findstr :${this.port}`;
      } else if (this.platform === 'darwin' || this.platform === 'linux') {
        // macOS/Linux: Use lsof or ss/netstat
        command = `lsof -i :${this.port} -P -n 2>/dev/null || ss -tulpn 2>/dev/null | grep :${this.port} || netstat -tulpn 2>/dev/null | grep :${this.port}`;
      }

      if (!command) return null;

      try {
        const output = execSync(command, { 
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        }).trim();

        if (!output) return null;

        // Parse the output to extract PID and process info
        return this.parseProcessOutput(output);
      } catch (execError) {
        // Command failed, port might be free or permission issues
        return null;
      }
    } catch (error) {
      console.error(`${colors.red}Error checking process info:${colors.reset}`, error.message);
      return null;
    }
  }

  /**
   * Parse process output based on platform
   */
  parseProcessOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (this.platform === 'win32') {
        // Windows netstat format: TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
        const match = line.match(/:3000.*\s+(\d+)/);
        if (match) {
          const pid = match[1];
          return { pid: parseInt(pid), command: this.getProcessCommand(pid) };
        }
      } else {
        // macOS/Linux lsof format: COMMAND   PID   USER   FD   TYPE   DEVICE   SIZE/OFF   NODE   NAME
        // or ss/netstat format
        const lsofMatch = line.match(/^(\S+)\s+(\d+)/);
        if (lsofMatch) {
          const command = lsofMatch[1];
          const pid = lsofMatch[2];
          return { pid: parseInt(pid), command: command || this.getProcessCommand(pid) };
        }
        
        // For ss/netstat output
        const netMatch = line.match(/pid=(\d+)/);
        if (netMatch) {
          const pid = netMatch[1];
          return { pid: parseInt(pid), command: this.getProcessCommand(pid) };
        }
      }
    }
    
    return null;
  }

  /**
   * Get the actual command for a given PID
   */
  getProcessCommand(pid) {
    try {
      let command;
      if (this.platform === 'win32') {
        command = `wmic process where "ProcessId=${pid}" get CommandLine 2>nul`;
      } else {
        command = `ps -p ${pid} -o comm= 2>/dev/null || ps -p ${pid} -o args= 2>/dev/null`;
      }

      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();

      return output || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Verify if the process on port 3000 is a development server
   * @returns {Promise<boolean>} - True if it's a dev server
   */
  async isDevelopmentServer() {
    if (!this.processInfo) return false;

    const { command, pid } = this.processInfo;
    const devServerPatterns = [
      'vite',
      'node.*vite',
      'npm.*dev',
      'pnpm.*dev',
      'yarn.*dev',
      'dev-server',
      'next.*dev',
      'react-scripts.*start'
    ];

    const commandLower = command.toLowerCase();
    
    // Check if command matches development server patterns
    const isDevServer = devServerPatterns.some(pattern => 
      new RegExp(pattern, 'i').test(commandLower)
    );

    // Additional check: verify the process is actually running
    try {
      if (this.platform === 'win32') {
        execSync(`tasklist /FI "PID eq ${pid}" /NH`, { stdio: 'pipe' });
      } else {
        execSync(`kill -0 ${pid} 2>/dev/null`, { stdio: 'pipe' });
      }
      return isDevServer;
    } catch (error) {
      // Process doesn't exist
      return false;
    }
  }

  /**
   * Display process information
   */
  displayProcessInfo() {
    if (!this.processInfo) return;

    const { pid, command } = this.processInfo;
    console.log(`${colors.cyan}Process Information:${colors.reset}`);
    console.log(`${colors.dim}  PID:${colors.reset} ${pid}`);
    console.log(`${colors.dim}  Command:${colors.reset} ${command}`);
    console.log(`${colors.dim}  Port:${colors.reset} ${this.port}`);
  }

  /**
   * Start the development server
   */
  startDevServer() {
    console.log(`${colors.green}Starting development server on port ${this.port}...${colors.reset}`);
    
    // Use the existing package.json dev script
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, FORCE_COLOR: 'true' }
    });

    devProcess.on('error', (error) => {
      console.error(`${colors.red}Failed to start dev server:${colors.reset}`, error.message);
      process.exit(1);
    });

    devProcess.on('exit', (code, signal) => {
      if (code !== 0) {
        console.log(`${colors.yellow}Dev server exited with code ${code}${colors.reset}`);
      }
    });

    return devProcess;
  }

  /**
   * Main execution method
   */
  async run() {
    console.log(`${colors.blue}=== WildOut! Development Server Manager ===${colors.reset}\n`);

    // Check if port is in use
    const portInUse = await this.isPortInUse();
    
    if (portInUse) {
      console.log(`${colors.yellow}⚠️  Port ${this.port} is already in use${colors.reset}\n`);
      
      // Get process information
      this.processInfo = await this.getProcessInfo();
      
      if (this.processInfo) {
        this.displayProcessInfo();
        
        // Check if it's a development server
        const isDevServer = await this.isDevelopmentServer();
        
        if (isDevServer) {
          console.log(`\n${colors.green}✓ Development server already running on port ${this.port}${colors.reset}`);
          console.log(`${colors.dim}No new instance will be started.${colors.reset}`);
          console.log(`\n${colors.cyan}To access the application:${colors.reset}`);
          console.log(`  ${colors.dim}http://localhost:${this.port}${colors.reset}`);
          console.log(`\n${colors.yellow}If you need to restart, please stop the existing process first.${colors.reset}`);
          return;
        } else {
          console.log(`\n${colors.red}✗ Port ${this.port} is occupied by a non-development process${colors.reset}`);
          console.log(`${colors.red}Please stop the conflicting process or use a different port.${colors.reset}`);
          process.exit(1);
        }
      } else {
        console.log(`${colors.red}Unable to identify the process using port ${this.port}${colors.reset}`);
        console.log(`${colors.yellow}Please manually check and stop the process.${colors.reset}`);
        process.exit(1);
      }
    } else {
      console.log(`${colors.green}✓ Port ${this.port} is available${colors.reset}`);
      
      // Start the development server
      const devProcess = this.startDevServer();
      
      // Handle process termination
      process.on('SIGINT', () => {
        console.log(`\n${colors.yellow}Shutting down development server...${colors.reset}`);
        devProcess.kill();
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        devProcess.kill();
        process.exit(0);
      });
    }
  }
}

// Error handling wrapper
async function main() {
  try {
    const manager = new DevServerManager();
    await manager.run();
  } catch (error) {
    console.error(`${colors.red}Unexpected error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DevServerManager;