import { defineConfig } from 'vite';

export default defineConfig({
  base: '/workshop-generative-art/',

  server: {
    host: true,
    open: true,
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
  },
});