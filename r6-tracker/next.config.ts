import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@headlessui/react'],
    scrollRestoration: true,
  },
  // Configuration des headers pour la CSP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com; frame-src https://www.youtube.com https://youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.youtube.com; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ubisoft-avatars.akamaized.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'staticctf.akamaized.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.r6-api.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'r6-api.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'r6data.eu',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
    // Configuration des timeouts et erreurs
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // CSP mise à jour pour permettre YouTube
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com; frame-src https://www.youtube.com https://youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.youtube.com;",
    // Timeout augmenté pour les images lentes
    unoptimized: false,
  },
};

export default nextConfig;
