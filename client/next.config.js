/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vercel.blob.core.windows.net', // 如果使用Vercel Blob
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.aliyuncs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.zgsta.zhuge.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'img.zgsta.zhuge.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      // 增加对认证API路由的明确支持
      {
        source: '/api/auth/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/auth/:path*',
      },
      // 所有API路由保持在同一服务器内处理
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      }
    ]
  },
}

module.exports = nextConfig 