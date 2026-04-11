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
      await config.transform(config, '/mystery-box'),
      await config.transform(config, '/open-source-software'),
      await config.transform(config, '/hidden-tools'),
      await config.transform(config, '/best-free-developer-tools'),
      await config.transform(config, '/weekly-roundups'),
      await config.transform(config, '/weekly-roundups/2026-04-10'),
      await config.transform(config, '/weekly-roundups/2026-04-03'),
      await config.transform(config, '/weekly-roundups/2026-03-27'),
      await config.transform(config, '/about')
    ];
  }
};
