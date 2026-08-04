/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cuti/db', '@cuti/types'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
}

export default nextConfig
