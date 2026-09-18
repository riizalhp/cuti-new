import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Path absolut generated Prisma client (di-inject ke kode via define)
const generatedClientDir = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '../../packages/db/src/generated/client/index.js'
);

export default defineConfig({
  server: {
    port: 3003,
    host: true,
  },
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    tailwind(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    define: {
      __GENERATED_CLIENT_DIR__: JSON.stringify(generatedClientDir),
    },
    server: {
      watch: {
        usePolling: true,
        interval: 500,
      },
    },
  },
});
