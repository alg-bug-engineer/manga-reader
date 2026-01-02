import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 明确指定 Turbopack 根目录，避免工作区警告
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      },
    ],
    unoptimized: true, // 禁用图片优化，直接使用原始图片
  },
};

export default nextConfig;
