import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxied-images/:path*",
        destination: "http://202.90.198.22/IMAGE/:path*",
      },
      {
        source: "/api/proxied-images-172/:path*",
        destination: "http://172.19.1.142/IMAGE/:path*",
      },
    ];
  },
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
