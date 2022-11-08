import { createApp } from 'vue';
import VueAnalytics from 'vue-analytics';

import VueScrollTo from 'vue-scrollto';
import VueObserveVisibility from 'vue-observe-visibility';
import store from './js/vuex-store';
import createRouter from './js/router';
import i18n from './js/i18n';
import vuetify from './plugins/vuetify';

import App from './js/App.vue';

import './scss/main.scss';
import { debugLog } from './js/modules/tracking';

// Sync store & router with vuex-router-sync.
// TODO: FIX.
store.watch((state, getters) => {
  if (state.route.name === 'report') {
    return getters.selected;
  }
  return null;
},
() => {
  if (store.getters.selected.length > 0) {
    return store.dispatch('loadData');
  }
});
store.watch((state) => state.route && state.route.params.locale,
  () => store.dispatch('loadMetricMetadata'));

// Router navigation guard:
// Handles locale switching and redirecting from root URL to language-specific
// homepage. Also handles setting title & metadata.
const router = createRouter(store);
router.beforeEach((to, from, next) => {
  debugLog('Router guard: set metadata');
  debugLog(`${from.path} => ${to.path}`);
  const { t } = i18n.global;

  // Language handling.
  if (!to.params.locale) {
    next({
      ...to,
      params: {
        ...to.params,
        locale: i18n.locale,
      },
    });
  } else {
    i18n.locale = to.params.locale;
    document.lang = to.params.locale;
  }

  if (to.path !== from.path) {
    // Set title
    let title = t('strings.DurhamNeighborhoodCompass');
    let description = t('strings.metaDescriptionHome');

    if (to.name === 'report' && Object.keys(to.query).length) {
      const reportTitle = store.getters.reportTitle;
      if (reportTitle !== '') {
        title = `${reportTitle} - ${title}`;
        description = t('strings.metaDescriptionReport', { area: reportTitle });
      }
    } else if (to.name === 'compass') {
      const metricTitle = i18n.locale === 'es'
        ? store.state.metric.config.title_es
        : store.state.metric.config.title;
      const geographyName = store.state.geography.id && store.state.geography.id.length > 0
        ? ` (${t(`geographies.${store.state.geography.id}.name`)})`
        : '';

      // TODO: Add "Why is this important to metadata in a way that doesn't break the build process.
      // Using getters.metadataImportant seems to fail.
      description = `${t('strings.metaDescriptionMetric', {
        metric: metricTitle.toLocaleLowerCase(i18n.locale),
        geography: geographyName.toLocaleLowerCase(i18n.locale),
      })}`;
      title = `${metricTitle}${geographyName} - ${title}`;

      if (store.state.printMode === true) {
        title = `${title} - ${t('undermapButtons.printEmbed')}`;
        description = `${t('strings.metaDescriptionPrint', {
          metric: metricTitle.toLocaleLowerCase(i18n.locale),
          geography: geographyName.toLocaleLowerCase(i18n.locale),
        })}`;
      }
    }

    document.title = title;

    // Find old metatags.
    const metaTags = Array.from(document.querySelectorAll('[data-vue-router-controlled]'));

    let enUrl = '';
    let esUrl = '';
    if (to.params.locale === 'en') {
      enUrl = to.fullPath;
      esUrl = router.resolve({ ...to, params: { ...to.params, locale: 'es' } }).href;
    } else {
      enUrl = router.resolve({ ...to, params: { ...to.params, locale: 'en' } }).href;
      esUrl = to.fullPath;
    }

    const metaTagDefinitions = {
      lang: {
        lang: to.params.locale,
      },
      linkCanonical: {
        href: `${process.env.VUE_APP_BASE_URL}${to.fullPath}`,
      },
      linkEn: {
        href: `${process.env.VUE_APP_BASE_URL}${
          enUrl}`,
      },
      linkEs: {
        href: `${process.env.VUE_APP_BASE_URL}${
          esUrl}`,
      },
      description: {
        content:
        description,
      },
      ogTitle: {
        content:
        title,
      },
      ogUrl: {
        content: `${process.env.VUE_APP_BASE_URL}${to.fullPath}`,
      },
      ogDescription: {
        content:
        description,
      },
      ogType: {
        content: to.name === 'report' ? 'article' : 'website',
      },
    };

    metaTags.forEach((tag) => {
      const tagDef = metaTagDefinitions[tag.getAttribute('data-vue-router-controlled')];
      if (!tagDef) {
        return;
      }
      Object.keys(tagDef).forEach((key) => {
        tag.setAttribute(key, tagDef[key]);
      });
    });
  }

  next();
});

/* eslint-disable no-new */
/* eslint-disable no-unused-vars */
const app = createApp({
  data: () => ({ mapboxgl: null }),
  beforeCreate() {
    // Preload map resources so that they live on even between switching to Report and back.
    // @see https://github.com/mapbox/mapbox-gl-js/pull/9391
    import(/* webpackChunkName: "mapboxgl" */ 'mapbox-gl').then((mapboxgl) => {
      mapboxgl.prewarm();
      import(/* webpackChunkName: "mapboxgl" */ 'mapbox-gl/dist/mapbox-gl.css').then(() => {
        this.$root.mapboxgl = mapboxgl;
      });
    });
  },
  render: h => h(App),
});

app.config.productionTip = false;
app.use(VueScrollTo);
app.use(VueObserveVisibility);
app.use(vuetify);
app.use(router);
app.use(i18n);
app.use(store);

app.mount('#app');

// TODO - replace these with computed values
// Vue.filter('allcaps', (value) => {
//   if (!value) return '';
//   return String(value).toUpperCase();
// });
//
// Vue.filter('capitalize', (value) => {
//   if (!value) return '';
//   return String(value).charAt(0).toUpperCase() + String(value).slice(1);
// });

// Set string compare function based on locale dynamically.
const stringCompareEn = new Intl.Collator('en').compare;
const stringCompareEs = new Intl.Collator('es').compare;
i18n.localizedStringCompareFn = (a, b) => (i18n.locale === 'es' ? stringCompareEs(a, b) : stringCompareEn(a, b));

// Google analytics
// if (process.env.VUE_APP_GOOGLE_ANALYTICS_ID) {
//   Vue.use(VueAnalytics, {
//     id: process.env.VUE_APP_GOOGLE_ANALYTICS_ID,
//     router,
//     debug: {
//       sendHitTask: process.env.NODE_ENV === 'production',
//     },
//   });
// }
