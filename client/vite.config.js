import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      proxy: {
        '/api/n8n': {
          target: env.VITE_N8N_WEBHOOK_URL || 'https://bitlancetechhub.app.n8n.cloud',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/n8n/, ''),
        },
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: [
        '@fullcalendar/core',
        '@fullcalendar/react',
        '@fullcalendar/daygrid',
        '@fullcalendar/timegrid',
        '@fullcalendar/interaction',
      ],
    },
    build: {
      chunkSizeWarningLimit: 600,
      // Enable minification (esbuild is the default — fast & effective)
      minify: 'esbuild',
      rollupOptions: {
        output: {
          // Fine-grained manual chunks: each heavy lib loads only when its route is visited
          manualChunks(id) {
            // React core — always needed
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-core';
            }
            if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/@remix-run/')) {
              return 'router';
            }
            // Heavy dashboard-only libraries
            if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) {
              return 'charts';
            }
            if (id.includes('node_modules/@fullcalendar/')) {
              return 'calendar';
            }
            if (id.includes('node_modules/framer-motion/')) {
              return 'motion';
            }
            // 3D runtime — huge, only on landing/spline pages
            if (id.includes('@splinetool/')) {
              return 'spline';
            }
            // Office/export utilities — only in admin flows
            if (id.includes('node_modules/jspdf/') || id.includes('node_modules/xlsx/')) {
              return 'office-export';
            }
            // Auth SDKs — loaded on first auth-gated route
            if (id.includes('node_modules/firebase/')) {
              return 'firebase';
            }
            if (id.includes('node_modules/@supabase/')) {
              return 'supabase';
            }
            // Voice AI SDK — only on voice agent page
            if (id.includes('node_modules/retell-client-js-sdk/')) {
              return 'retell';
            }
            // UI utilities — small, share across most routes
            if (id.includes('node_modules/lucide-react/')) {
              return 'icons';
            }
            if (id.includes('node_modules/react-hot-toast/') || id.includes('node_modules/react-helmet-async/')) {
              return 'ui-utils';
            }
          },
        },
      },
    },
  }
})

