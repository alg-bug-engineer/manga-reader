import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 明确指定 Turbopack 根目录，避免工作区警告
  turbopack: {
    root: __dirname,
  },

  // 生产环境优化
  compress: true, // 启用 gzip 压缩
  poweredByHeader: false, // 隐藏 X-Powered-By 头

  // 图片优化配置
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
      {
        protocol: 'https',
        hostname: 'manga.ai-knowledgepoints.cn',
        pathname: '/api/images/**',
      },
    ],
    unoptimized: true, // 禁用图片优化，直接使用原始图片
  },

  // 实验性功能
  experimental: {
    // 优化包大小
    optimizePackageImports: ['react', 'react-dom'],
  },

  // 输出配置
  output: 'standalone', // 生成独立的构建产物，优化 Docker 部署

  // 生产环境 Source Map（仅在错误时使用）
  productionBrowserSourceMaps: false,

  // React 严格模式
  reactStrictMode: true,
};

export default nextConfig;
