/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://aigardendesign.org',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://aigardendesign.org/sitemap.xml',
    ],
  },
  exclude: ['/auth-success', '/auth-error'],
  generateIndexSitemap: false,
  outDir: 'public',
} 