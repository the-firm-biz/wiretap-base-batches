import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'euc.li'
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net'
      }
    ]
  }
};

export default nextConfig;
