import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/leaderboard',
        destination: '/explore?tab=rankings',
        permanent: true,
      },
      {
        source: '/leaderboard/:path*',
        destination: '/explore?tab=rankings',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'thesvg.org',
        pathname: '/icons/**',
      },
    ],
  },
};

export default nextConfig;
