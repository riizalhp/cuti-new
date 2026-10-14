import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Izinkan akses dev server dari HP di jaringan lokal dan localhost (tanpa ini halaman tidak hydrate)
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.*.*", "172.16.*.*", "172.25.*.*", "10.*.*.*"],
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  transpilePackages: ["@employr/ui", "@employr/config", "@employr/db", "@employr/faq"],
  serverExternalPackages: ["pdf-parse", "mammoth", "playwright-core", "nodemailer"],

  // Enable optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Security & CORS headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/request-fitur",
        destination: "/saran-fitur",
        permanent: true,
      },
    ];
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons", "framer-motion", "recharts"],
  },
};

export default nextConfig;
