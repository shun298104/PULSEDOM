// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path' // ← これを追加！

export default defineConfig({
  plugins: [react()],
  base: '/PULSEDOM/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
