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
      }
    ],
  },
};

export default nextConfig;
