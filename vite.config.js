import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'motion', 'clsx', 'tailwind-merge', 'qrcode.react'],
          charts: ['recharts'],
          utils: ['socket.io-client'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})