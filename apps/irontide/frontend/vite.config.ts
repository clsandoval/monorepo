import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: { target: 'esnext', outDir: 'dist' },
  server: { port: 5173 },
  define: { '__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production') },
});
