import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: 'http',
        hostname: '202.90.198.22',
        port: '',
        pathname: '/IMAGE/HOTSPOT/**',
      },
    ],
  },
};



export default nextConfig;
