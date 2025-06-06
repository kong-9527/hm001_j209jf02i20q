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
}

module.exports = nextConfig 