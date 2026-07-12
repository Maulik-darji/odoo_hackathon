import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;
