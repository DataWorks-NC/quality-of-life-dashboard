const dataConfig = require('./data/config/data.js');

// Create render routes for each metric at each geography level.
const metricRoutes = ['en', 'es'].flatMap(
  lang => ([`/${lang}/`, `/${lang}/report/blockgroup/`, `/${lang}/report/tract/`].concat(Object.values(dataConfig).flatMap(
    m => (m.geographies.map(
      g => (`/${lang}/compass/${m.metric}/${g}/`),
    )),
  ))),
);

module.exports = {

  lintOnSave: false,

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
    prerenderSpa: {
      registry: undefined,
      renderRoutes: ['/'].concat(metricRoutes),
      useRenderEvent: true,
      headless: true,
      onlyProduction: true,
      postProcess: (route) => {
        // Defer scripts and tell Vue it's been server rendered to trigger hydration
        route.html = route.html
          .replace(/<script (.*?)>/g, '<script $1 defer>')
          .replace('id="app"', 'id="app" data-server-rendered="true"');
        return route;
      },
    },
  },
};
