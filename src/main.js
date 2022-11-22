import { computed } from 'vue';
import { ViteSSG } from 'vite-ssg';
import dataConfig from '../data/config/data';

// TODO: Add analytics.

import { routerOptions, setUpRouterHooks } from './plugins/router';
import i18n from './plugins/i18n';
import vuetify from './plugins/vuetify';

import App from './js/App.vue';
import { Head } from '@vueuse/head';

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
    app.config.unwrapInjectedRef = true;
    app.component('SetHead', Head);

    setUpRouterHooks(router);

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

    if (!import.meta.env.SSR) {
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
