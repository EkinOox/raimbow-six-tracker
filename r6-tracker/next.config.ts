import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Timeout augmenté pour les images lentes
    unoptimized: false,
  },
};

export default nextConfig;
