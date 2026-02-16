import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
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
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            ui: ['lucide-react', 'framer-motion']
          }
        }
      }
    }
  }
})
