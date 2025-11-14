declare module 'npm:*' {
  const value: any;
  export default value;
}

declare module 'jsr:*' {
  const value: any;
  export default value;
}

declare module 'npm:hono' {
  const value: any;
  export default value;
}

declare module 'npm:hono/cors' {
  const value: any;
  export default value;
}

declare module 'npm:hono/logger' {
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

declare const Deno: {
  env: {
    get(key: string): string | undefined;
    toObject(): Record<string, string>;
  };
  args: string[];
};

