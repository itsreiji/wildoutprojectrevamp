
declare module 'jsr:*' {
  const value: any;
  export default value;
}

declare module 'figma:*' {
  const value: string;
  export default value;
}

declare module '@jsr/supabase__supabase-js' {
  export type SupabaseClient = any;
  export type SupabaseClientOptions = any;
  export function createClient<Database = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions
  ): SupabaseClient;
}

declare module 'vitest';

// Deno namespace for Supabase Edge Functions
declare namespace Deno {
  const env: {
    get(key: string): string | undefined;
    toObject(): Record<string, string>;
  };
  const args: string[];
  function serve<T>(
    handler: (request: Request) => Response | Promise<Response>,
    options?: { port?: number }
  ): void;
}

// Extend Window interface for browser environment
interface Window {
  Deno?: typeof Deno;
}

// Add custom environment variables interface
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

