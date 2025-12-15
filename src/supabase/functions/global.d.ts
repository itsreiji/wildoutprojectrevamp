// Global type declarations for Deno runtime in Supabase Edge Functions

declare namespace Deno {
  interface Env {
    [name: string]: string | undefined;
  }
  
  namespace env {
    function get(name: string): string | undefined;
    function set(name: string, value: string): void;
  }
  
  function serve(requestHandler: (request: Request) => Response | Promise<Response>): void;
}

// Declare module for ESM imports
declare module 'https://esm.sh/@supabase/supabase-js@2.49.8' {
  export { createClient } from '@supabase/supabase-js';
}

// Declare module for local imports
declare module './kv_store' {
  export const set: (key: string, value: any) => Promise<void>;
  export const get: (key: string) => Promise<any>;
  export const del: (key: string) => Promise<void>;
  export const mset: (keys: string[], values: any[]) => Promise<void>;
  export const mget: (keys: string[]) => Promise<any[]>;
  export const mdel: (keys: string[]) => Promise<void>;
  export const getByPrefix: (prefix: string) => Promise<any[]>;
}

declare module './audit' {
  interface AuditLog {
    action: string;
    table_name: string;
    record_id?: string;
    user_id?: string;
    user_role?: string;
    old_data?: Record<string, any>;
    new_data?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    details?: Record<string, any>;
  }
  
  export const logAuditEvent: (logEntry: AuditLog) => Promise<void>;
}