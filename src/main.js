import { computed } from 'vue';
import { ViteSSG } from 'vite-ssg';
import dataConfig from '../data/config/data';

// TODO: Add analytics.

import store from './js/vuex-store';
import { routerOptions, setUpRouterHooks } from './plugins/router';
import i18n from './plugins/i18n';
import vuetify from './plugins/vuetify';

import App from './js/App.vue';

import '@/scss/main.scss';
import { debugLog } from './js/modules/tracking';

// TODO: Refactor routeguards into a separate file.
// Router navigation guard:
// Handles locale switching and redirecting from root URL to language-specific
// homepage. Also handles setting title & metadata.

export const createApp = ViteSSG(
  App,
  routerOptions,
  ({ app, router }) => {
    app.config.productionTip = false;
    app.use(vuetify);
    app.use(i18n);
    app.use(store);

    setUpRouterHooks(router, store);

    router.beforeEach((to, from) => {
      debugLog('Router guard: set language');
      debugLog(`${from.path} => ${to.path}`);
      debugLog(to);

      // Language handling.
      if (!to.params.locale) {
        return {
          ...to,
          params: {
            ...to.params,
            locale: i18n.global.locale,
          },
        };
      } else {
        i18n.global.locale.value = to.params.locale;
        if (typeof window !== 'undefined') {
          window.document.lang = to.params.locale;
        }
      }
//  TODO: Add metadata population using vite-ssr
//
//   if (to.path !== from.path) {
//     // Set title
//     let title = t('strings.DurhamNeighborhoodCompass');
//     let description = t('strings.metaDescriptionHome');
//
//     if (to.name === 'report' && Object.keys(to.query).length) {
//       const reportTitle = store.getters.reportTitle;
//       if (reportTitle !== '') {
//         title = `${reportTitle} - ${title}`;
//         description = t('strings.metaDescriptionReport', { area: reportTitle });
//       }
//     } else if (to.name === 'compass') {
//       const metricTitle = i18n.locale === 'es'
//         ? store.state.metric.config.title_es
//         : store.state.metric.config.title;
//       const geographyName = store.state.geography.id && store.state.geography.id.length > 0
//         ? ` (${t(`geographies.${store.state.geography.id}.name`)})`
//         : '';
//
//       // TODO: Add "Why is this important to metadata in a way that doesn't break the build process.
//       // Using getters.metadataImportant seems to fail.
//       description = `${t('strings.metaDescriptionMetric', {
//         metric: metricTitle.toLocaleLowerCase(i18n.locale),
//         geography: geographyName.toLocaleLowerCase(i18n.locale),
//       })}`;
//       title = `${metricTitle}${geographyName} - ${title}`;
//
//       if (store.state.printMode === true) {
//         title = `${title} - ${t('undermapButtons.printEmbed')}`;
//         description = `${t('strings.metaDescriptionPrint', {
//           metric: metricTitle.toLocaleLowerCase(i18n.locale),
//           geography: geographyName.toLocaleLowerCase(i18n.locale),
//         })}`;
//       }
//     }
//
//     document.title = title;
//
//     // Find old metatags.
//     const metaTags = Array.from(document.querySelectorAll('[data-vue-router-controlled]'));
//
//     let enUrl = '';
//     let esUrl = '';
//     if (to.params.locale === 'en') {
//       enUrl = to.fullPath;
//       esUrl = router.resolve({ ...to, params: { ...to.params, locale: 'es' } }).href;
//     } else {
//       enUrl = router.resolve({ ...to, params: { ...to.params, locale: 'en' } }).href;
//       esUrl = to.fullPath;
//     }
//
//     const metaTagDefinitions = {
//       lang: {
//         lang: to.params.locale,
//       },
//       linkCanonical: {
//         href: `${import.meta.env.BASE_URL}${to.fullPath}`,
//       },
//       linkEn: {
//         href: `${import.meta.env.BASE_URL}${
//           enUrl}`,
//       },
//       linkEs: {
//         href: `${import.meta.env.BASE_URL}${
//           esUrl}`,
//       },
//       description: {
//         content:
//         description,
//       },
//       ogTitle: {
//         content:
//         title,
//       },
//       ogUrl: {
//         content: `${import.meta.env.BASE_URL}${to.fullPath}`,
//       },
//       ogDescription: {
//         content:
//         description,
//       },
//       ogType: {
//         content: to.name === 'report' ? 'article' : 'website',
//       },
//     };
//
//     metaTags.forEach((tag) => {
//       const tagDef = metaTagDefinitions[tag.getAttribute('data-vue-router-controlled')];
//       if (!tagDef) {
//         return;
//       }
//       Object.keys(tagDef).forEach((key) => {
//         tag.setAttribute(key, tagDef[key]);
//       });
//     });
//   }
//
    });

    const stringCompareEn = new Intl.Collator('en').compare;
    const stringCompareEs = new Intl.Collator('es').compare;
// Set string compare function based on locale dynamically.
    app.config.globalProperties.localizedSortByName = (a, b) => (i18n.global.locale === 'es' ? stringCompareEs(a, b) : stringCompareEn(a, b));
    app.config.globalProperties.$filters = {
      allcaps: (value) => {
        if (!value) return '';
        return String(value).toUpperCase();
      },
      capitalize: (value) => {
        if (!value) return '';
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
      },
    };
    let mapboxglLoaded = false;
    app.provide('mapboxglLoaded', () => computed(() => mapboxglLoaded));

    import(/* webpackChunkName: "mapboxgl" */ 'mapbox-gl').then((mapboxgl) => {
      if (!mapboxgl || !mapboxgl.prewarm) {
        return;
      }
      mapboxgl.prewarm();
      import(/* webpackChunkName: "mapboxgl" */ 'mapbox-gl/dist/mapbox-gl.css').then(() => {
        mapboxglLoaded = true;
        app.provide('mapboxgl', mapboxgl);
      });
    });
  }
);

// TODO: Add analytics back in.
// Google analytics
// if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
//   Vue.use(VueAnalytics, {
//     id: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
//     router,
//     debug: {
//       sendHitTask: import.meta.env.PROD,
//     },
//   });
// }

// Specify all routes to be pre-rendered.
export function includedRoutes() {
  return ['en', 'es'].flatMap(
    lang => ([
      `/${lang}/`,
      `/${lang}/about/`,
      `/${lang}/report/blockgroup/`,
      `/${lang}/report/tract/`,
    ].concat(Object.values(dataConfig).filter(m => !m.exclude_from_map).flatMap(
      m => m.geographies.map(
          g => `/${lang}/compass/${m.metric}/${g}/`)
    ))
  ));
}
