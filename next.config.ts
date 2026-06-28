import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'ultimate-guitar',
    'got-scraping',
    'header-generator',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
