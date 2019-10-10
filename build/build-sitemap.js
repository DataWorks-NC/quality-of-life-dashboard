const SitemapGenerator = require('advanced-sitemap-generator');
const dataConfig = require('../data/config/data.js');

// Create render routes for each metric at each geography level.
const metricRoutes = ['en', 'es'].flatMap(
  lang => ([`/${lang}`, `/${lang}/report/blockgroup`, `/${lang}/report/tract`].concat(Object.values(dataConfig).flatMap(
    m => (m.geographies.map(
      g => (`/${lang}/compass/${m.metric}/${g}`),
    )),
  ))),
);

// create generator
const generator = SitemapGenerator('https://compass.durhamnc.gov', {
  ignoreHreflang: false,
  changeFreq: 'monthly',
  filepath: './dist/sitemap.xml',
});

const referrer = {
  url: 'https://compass.durhamnc.gov',
  host: 'compass.durhamnc.gov',
};

metricRoutes.forEach(
  route => generator.queueURL(`https://compass.durhamnc.gov${route}`, referrer),
);

// Register event listeners
generator.on('done', () => {
});

// Start the crawler
generator.start();
