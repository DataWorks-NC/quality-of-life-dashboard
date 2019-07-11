const dataConfig = require('./data/config/data.js');

// Create render routes for each metric at each geography level.
const metricRoutes = Object.values(dataConfig).flatMap(
  (m) =>
    (m.geographies.flatMap((g) => ([`/en/compass/${m.metric}/${g}/`, `/es/compass/${m.metric}/${g}/`])))
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
    },
  },
};
