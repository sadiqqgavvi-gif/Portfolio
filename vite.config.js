import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Source lives in app/. The production build is written to the repository root, because GitHub Pages
// serves this repo straight from the root of the main branch (no build step on the host).
export default defineConfig({
  root: 'app',
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1200
  }
});
