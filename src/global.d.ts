// Global type declarations for browser and Node.js APIs
// This file provides type definitions for global objects used throughout the application

declare global {
  // Browser APIs
  const console: Console;
  const localStorage: Storage;
  const window: Window & typeof globalThis;
  const document: Document;
  const navigator: Navigator;
  const fetch: typeof globalThis.fetch;
  const requestAnimationFrame: (callback: FrameRequestCallback) => number;
  const cancelAnimationFrame: (id: number) => void;
  const setTimeout: (callback: () => void, ms?: number) => NodeJS.Timeout;
  const clearTimeout: (id: NodeJS.Timeout | number) => void;
  const sessionStorage: Storage;

  // Node.js APIs (for server-side rendering and edge functions)
  const Deno: {
    serve: (handler: (request: Request) => Response | Promise<Response>) => void;
    env: {
      get: (key: string) => string | undefined;
    };
  };
  const NodeJS: {
    Timeout: NodeJS.Timeout;
  };
  const __dirname: string;

  // Crypto API
  const crypto: Crypto;

  // Database type (used in type definitions)
  interface Database {
    [key: string]: any; // This is intentional for dynamic database access
  }
}

// Supabase types
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any; // Generic JSON content type
  export default content;
}

