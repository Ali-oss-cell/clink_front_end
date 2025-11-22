import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Use esbuild (faster) instead of terser
    // Remove console and debugger in production
    esbuild: {
      drop: ['console', 'debugger'],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['react-icons', 'react-player'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
  },
})
