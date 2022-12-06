import {ViteSSG} from 'vite-ssg';
import VueGtag from 'vue-gtag';

import {routerOptions, setUpRouterHooks} from './plugins/router';
import i18n from './plugins/i18n';
import vuetify from './plugins/vuetify';

import App from './js/App.vue';
import {Head} from '@vueuse/head';

import '@/scss/main.scss';
import {debugLog} from './js/modules/tracking';

export const createApp = ViteSSG(
  App,
  routerOptions,
  ({app, router}) => {
    app.config.productionTip = false;
    app.use(vuetify);
    app.use(i18n);
    app.config.unwrapInjectedRef = true;
    app.component('SetHead', Head);
    app.use(VueGtag, {
        config:
          {
            id: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
            params: {
              anonymize_ip: true,
            }
          },
      }
    );

    setUpRouterHooks(router);

    router.beforeEach((to, from) => {
      debugLog('Router guard: set language');
      debugLog(`${from.path} => ${to.path}`);
      debugLog(to);

      // Language handling.
      if (!to.params.locale) {
        debugLog('Redirecting with language set.');
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
    app.config.globalProperties.localizedSortByName = (a, b) => (i18n.global.locale === 'es' ?
      stringCompareEs(a, b) :
      stringCompareEn(a, b));
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
  },
);
