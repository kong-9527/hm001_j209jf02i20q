/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 在统一部署模型下，不需要特殊的 API 重写，删除或注释掉这部分
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://apiaigardendesign.org/api/:path*',
  //     },
  //   ]
  // },
  // 添加动态路由支持配置
  trailingSlash: false, // 添加尾部斜杠，有助于处理动态路由
  async rewrites() {
    return [
      // 确保garden-advisor详情页面的动态路由能够正确处理
      {
        source: '/dashboard/garden-advisor/:id/',
        destination: '/dashboard/garden-advisor/[id]/',
      },
      {
        source: '/dashboard/garden-advisor/:id',
        destination: '/dashboard/garden-advisor/[id]',
      },
    ];
  },
  async redirects() {
    return [
      // 处理可能的404情况，重定向到正确的路径
      {
        source: '/dashboard/garden-advisor/undefined',
        destination: '/dashboard/garden-advisor',
        permanent: false,
      },
      {
        source: '/dashboard/garden-advisor/null',
        destination: '/dashboard/garden-advisor',
        permanent: false,
      },
    ];
  },
  // 添加Headers配置用于缓存控制
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 