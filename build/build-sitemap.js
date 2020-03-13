const SitemapGenerator = require('advanced-sitemap-generator');
const vueConfig = require('../vue.config.js');

const renderRoutes = vueConfig.pluginOptions.prerenderSpa.renderRoutes;

// Get domain name from command line if it's passed through.
const domainName = process.argv[2] ? process.argv[2] : 'compass.durhamnc.gov';
const protocol = (process.argv[3] && process.argv[3] === 'http') ? 'http://' : 'https://';

// create generator
const generator = SitemapGenerator(`${protocol}${domainName}`, {
  ignoreHreflang: false,
  changeFreq: 'monthly',
  filepath: './dist/sitemap.xml',
  respectRobotsTxt: false, // Since there will be a robots.txt on our dev site which we need to crawl.
});

const referrer = {
  url: `${protocol}${domainName}`,
  host: domainName,
};

renderRoutes.forEach(
  route => generator.queueURL(`${protocol}${domainName}${route}`, referrer),
);

// Register event listeners
generator.on('done', () => {
});

// Start the crawler
generator.start();
