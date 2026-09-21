import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cloudflare Pages: build estático (dist). Proxy server-side via functions/api/*.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev local: /api/anivexa -> Anivexa real (evita CORS e esconde base no código).
      // Defina ANIVEXA_BASE_URL no .env ou use o default público documentado.
      '/api/anivexa': {
        target: process.env.ANIVEXA_BASE_URL || 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/anivexa/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
