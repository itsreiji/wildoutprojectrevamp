import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'import.meta.vitest': 'undefined',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'vaul@1.1.2': 'vaul',
      'sonner@2.0.3': 'sonner',
      'recharts@2.15.2': 'recharts',
      'react-resizable-panels@2.1.7': 'react-resizable-panels',
      'react-hook-form@7.55.0': 'react-hook-form',
      'react-day-picker@8.10.1': 'react-day-picker',
      'next-themes@0.4.6': 'next-themes',
      'lucide-react@0.487.0': 'lucide-react',
      'input-otp@1.4.2': 'input-otp',
      'figma:asset/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png': path.resolve(__dirname, './src/assets/7f0e33eb82cb74c153a3d669c82ee10e38a7e638.png'),
      'embla-carousel-react@8.6.0': 'embla-carousel-react',
      'cmdk@1.1.1': 'cmdk',
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
      '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
      '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
      '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
      '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
      '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
      '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
      '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
      '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
      '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
      '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
      '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
      '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
      '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
      '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
      '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
      '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
      '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
      '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
      '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
      '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
      '@jsr/supabase__supabase-js@2.49.8': '@jsr/supabase__supabase-js',
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true, // Generate source maps for better debugging
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }
            if (id.includes('date-fns') || id.includes('crypto-js')) {
              return 'utils';
            }
            return 'vendor-other';
          }
          if (id.includes('styles') || id.includes('.css')) {
            return 'styles';
          }
          return undefined;
        },
        sourcemapExcludeSources: false,
        sourcemapFileNames: '[name].[hash].js.map',
      },
      onwarn: (warning, warn) => {
        // Suppress sourcemap warnings for specific UI components
        if (warning.code === 'SOURCEMAP_ERROR' &&
            warning.id &&
            warning.id.includes('src/components/ui/')) {
          return;
        }
        warn(warning);
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    host: '0.0.0.0',
    allowedHosts: [
      'hyakutake-in.ts.net',
      '*.hyakutake-in.ts.net',
      '0.0.0.0',
      'skypiea-pc.hyakutake-in.ts.net',
    ],
    proxy: {
      // Proxy Inngest API requests from Vite to the Inngest dev server
      // This allows http://localhost:5173/api/inngest to work
      '/api/inngest': {
        target: 'http://127.0.0.1:8288',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/inngest/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('Proxy error:', err.message);
            if ('writeHead' in res && typeof res.writeHead === 'function') {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Inngest dev server not running. Start it with: npx inngest dev -u http://localhost:5173');
            }
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, '->', options.target);
          });
        },
      },
    },
  },
});
