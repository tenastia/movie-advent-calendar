import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Two pages: the calendar at /, the motion lab at /lab/.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        lab: resolve(import.meta.dirname, 'lab/index.html'),
      },
    },
  },
});
