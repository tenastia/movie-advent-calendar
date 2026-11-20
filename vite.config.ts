import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs let the static build be served from any path (previews, sub-folders).
  base: './',
  plugins: [react()],
});
