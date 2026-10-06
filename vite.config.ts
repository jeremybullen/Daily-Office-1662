import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.ESV_API_KEY': JSON.stringify(process.env.ESV_API_KEY || '3f7fb8c898296bcae9d9988bf04855d467d844e9'),
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
