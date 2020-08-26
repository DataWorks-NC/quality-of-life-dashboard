const dataConfig = require('./data/config/data.js');

// Create render routes for each metric at each geography level.
const renderRoutes = ['en', 'es'].flatMap(
  lang => ([`/${lang}/`, `/${lang}/report/blockgroup/`, `/${lang}/about/`, `/${lang}/report/tract/`].concat(Object.values(dataConfig).flatMap(
    m => (m.geographies.map(
      g => `/${lang}/compass/${m.metric}/${g}/`,
    )),
  ))),
);

const environmentDefaults = {
  VUE_APP_GOOGLE_SEARCH_CONSOLE_VERIFICATION: '',
  VUE_APP_GOOGLE_ANALYTICS_ID: false,
  VUE_APP_I18N_LOCALE: 'en',
  VUE_APP_I18N_FALLBACK_LOCALE: 'en',
  VUE_APP_MAILCHIMP_SIGNUP_URL: '',
  VUE_APP_BASE_URL: 'http://localhost:8080',
};

// Properly set base URL in CI environment.
if (process.env.CIRCLE_BRANCH) {
  if (process.env.CIRCLE_BRANCH === 'staging') {
    environmentDefaults.VUE_APP_BASE_URL = 'https://nbhdcompassstage.azurewebsites.us';
  } else if (process.env.CIRCLE_BRANCH === 'develop') {
    environmentDefaults.VUE_APP_BASE_URL = 'https://nbhdcompassdev.azurewebsites.us';
  } else {
    environmentDefaults.VUE_APP_BASE_URL = 'https://compass.durhamnc.gov';
  }
}

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
    pwa: {
      iconPaths: {
        favicon32: 'img/favicon-32x32.png',
        favicon16: 'img/favicon-16x16.png',
        appleTouchIcon: 'img/apple-touch-icon-152x152.png',
        maskIcon: 'img/safari-pinned-tab.svg',
        msTileImage: 'img/msapplication-icon-144x144.png',
      },
    },
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
    prerenderSpa: {
      registry: undefined,
      renderRoutes,
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
