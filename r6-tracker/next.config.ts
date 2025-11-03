import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@headlessui/react'],
    scrollRestoration: true,
  },
  
  // Compression et minification
  compress: true, // Active la compression gzip
  poweredByHeader: false, // Supprime l'en-tête X-Powered-By
  
  // Désactiver les source maps en production pour réduire la taille et éviter les erreurs
  productionBrowserSourceMaps: false,
  
  // Compilation optimisée
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Configuration des headers pour la CSP et sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production' 
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.youtube.com https://s.ytimg.com; frame-src https://www.youtube.com https://youtube.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://www.youtube.com https://*.r6-api.vercel.app https://r6data.eu; font-src 'self' data: https://cdn.jsdelivr.net; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests;"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.youtube.com https://s.ytimg.com; frame-src https://www.youtube.com https://youtube.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://www.youtube.com ws: wss:; font-src 'self' data: https://cdn.jsdelivr.net; object-src 'none';",
          },
          // HSTS - Force HTTPS (uniquement en production)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }] : []),
          // Empêcher le clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prévenir le sniffing MIME
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Politique de référent
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
          },
          // Cross-Origin Opener Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Cross-Origin Resource Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      // Cache pour les ressources statiques
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Configuration des images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Qualité optimisée pour réduire la taille (par défaut 75)
    // 70 offre un bon compromis taille/qualité
    loader: 'default',
    loaderFile: undefined,
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
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 31536000, // 1 an
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com; frame-src https://www.youtube.com https://youtube.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://www.youtube.com; font-src 'self' data: https://cdn.jsdelivr.net;",
    unoptimized: false,
  },
};

export default nextConfig;
