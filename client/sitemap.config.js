// Sitemap configuration
module.exports = {
  siteUrl: 'https://vinitamart.com',
  generateRobotsTxt: true, // (optional)
  exclude: ['/server-sitemap.xml', '/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/seller'],
      },
    ],
    additionalSitemaps: [
      'https://vinitamart.com/sitemap.xml',
      'https://vinitamart.com/server-sitemap.xml',
    ],
  },
  // ...other options
};
