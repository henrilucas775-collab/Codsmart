import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Chemins relatifs : l'app packagée charge dist/index.html en file://
  base: './',
  plugins: [react()]
});
