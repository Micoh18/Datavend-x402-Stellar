import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'events', 'http', 'https', 'url'],
      globals: { Buffer: true },
    }),
  ],
  server: {
    // Proxy Horizon requests to avoid CORS issues in dev
    proxy: {
      '/horizon': {
        target: 'https://horizon-testnet.stellar.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/horizon/, ''),
      },
    },
  },
})
