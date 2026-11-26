import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { devApi } from './netlify/dev/devApi';

// Two pages: the calendar at /, the motion lab at /lab/.
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Runs the API functions (netlify/functions) and Netlify Blobs locally in `npm run dev`.
    command === 'serve' && !process.env.VITEST && devApi(import.meta.dirname),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        lab: resolve(import.meta.dirname, 'lab/index.html'),
      },
    },
  },
}));
