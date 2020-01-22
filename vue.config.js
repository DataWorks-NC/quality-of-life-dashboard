const dataConfig = require('./data/config/data.js');

// Create render routes for each metric at each geography level.
const metricRoutes = ['en', 'es'].flatMap(
  lang => ([`/${lang}/`, `/${lang}/report/blockgroup/`, `/${lang}/report/tract/`].concat(Object.values(dataConfig).flatMap(
    m => (m.geographies.map(
      g => (`/${lang}/compass/${m.metric}/${g}/`),
    )),
  ))),
);

const environmentDefaults = {
  VUE_APP_GOOGLE_SEARCH_CONSOLE_VERIFICATION: '',
  VUE_APP_GOOGLE_ANALYTICS_ID: false,
  VUE_APP_I18N_LOCALE: 'en',
  VUE_APP_I18N_FALLBACK_LOCALE: 'en',
};

process.env = {
  ...environmentDefaults,
  ...process.env,
};

if (!('VUE_APP_MAPBOX_ACCESS_TOKEN' in process.env) || process.env.VUE_APP_MAPBOX_ACCESS_TOKEN === '<FILL THIS IN>') {
  console.error('VUE_APP_MAPBOX_ACCESS_TOKEN environment variable must be set! Try adding it to a .env file in the repo root.');
}

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
          .replace(/<script (.*?)><\/script>/g, '<script $1 defer></script>')
          .replace('id="app"', 'id="app" data-server-rendered="true"');
        return route;
      },
    },
  },
};
