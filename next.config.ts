import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // serverComponentsExternalPackages: ["@jsr/supabase__supabase-js"], // Removed deprecated option
  },
  env: {
    // Environment variables that should be available in the browser
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_ADMIN_BASE_PATH: process.env.VITE_ADMIN_BASE_PATH || process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || '/sadmin',
    NEXT_PUBLIC_USE_DUMMY_DATA: process.env.VITE_USE_DUMMY_DATA || process.env.NEXT_PUBLIC_USE_DUMMY_DATA || 'false',
  },
  images: {
    // Configure image optimization settings if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'your-supabase-project.supabase.co',
      },
    ], // Add your image domains as remote patterns
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle fs module for client-side code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Important: return the modified config
    return config;
  },
  // Add turbopack config to resolve build conflict
  turbopack: {},
};

export default nextConfig;