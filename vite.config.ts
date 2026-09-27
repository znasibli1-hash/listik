import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';

// `npm run build` -> normal multi-file build (for any static host)
// `npm run build:single` -> one self-contained index.html (used for the hosted demo)
export default defineConfig(({ mode }) => ({
  base: '/listik/',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
}));
