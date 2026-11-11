import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Caminhos relativos: o mesmo build funciona na raiz (local) e em /SITE-3M/ (GitHub Pages). */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { assetsInlineLimit: 0 },
});
