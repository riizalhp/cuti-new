import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Izinkan akses dev server dari HP di jaringan lokal (tanpa ini halaman tidak hydrate)
  allowedDevOrigins: ['192.168.*.*', '172.16.*.*', '172.25.*.*', '10.*.*.*'],
  transpilePackages: ['@employr/db', '@employr/types'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '/**': [
      './packages/db/src/generated/client/schema.prisma',
      '../../packages/db/src/generated/client/schema.prisma',
      './packages/db/src/generated/client/query_engine-windows.dll.node',
      '../../packages/db/src/generated/client/query_engine-windows.dll.node',
      './packages/db/src/generated/client/libquery_engine*',
      '../../packages/db/src/generated/client/libquery_engine*',
    ],
  },
  devIndicators: {
    position: 'bottom-right',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
}

export default nextConfig
