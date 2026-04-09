/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://thecloudrain.site',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/control-room/*', '/admin', '/api/*'],
  additionalPaths: async (config) => {
    return [
      await config.transform(config, '/free-tools'),
      await config.transform(config, '/contact'),
      await config.transform(config, '/general-queries'),
      await config.transform(config, '/mystery-box')
    ];
  }
};
