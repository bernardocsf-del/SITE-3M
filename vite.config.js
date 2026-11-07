import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* No GitHub Pages o site mora em /SITE-3M/; localmente (dev) fica na raiz. */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/SITE-3M/' : '/',
  plugins: [react()],
  build: { assetsInlineLimit: 0 },
}));
