/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly NODE_ENV?: 'development' | 'production' | 'test';
  readonly VITE_ADMIN_BASE_PATH?: string;
  readonly VITE_APP_ENV?: string;
  readonly MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

