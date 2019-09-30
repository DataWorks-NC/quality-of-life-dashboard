import Vue from 'vue';
import VueAnalytics from 'vue-analytics';

import store from './js/vuex-store';
import router from './js/router';
import i18n from './js/i18n';
import config from './js/modules/config';
import vuetify from './plugins/vuetify';

import App from './js/App';

import './scss/main.scss';

Vue.config.productionTip = false;

// Router navigation guard:
// Handles locale switching and redirecting from root URL to language-specific
// homepage. Also handles setting title & metadata.
router.beforeEach((to, from, next) => {
  // Language handling.
  let language = to.params.locale;

  if (!language) {
    language = i18n.locale;
  } else {
    i18n.locale = language;
  }
  to.params.locale = language;

  store.dispatch('setLanguage', language).then(() => {
    // Set title
    let title = i18n.t('strings.DurhamNeighborhoodCompass');
    const description = store.getters.metadataImportant !== '' ? store.getters.metadataImportant.replace(/<p>/, '').replace(/<\/p>/, '') : i18n.t('strings.about');

    if (to.name === 'report') {
      const reportTitle = store.getters.reportTitle;
      if (reportTitle !== '') {
        title = `${title} - ${reportTitle}`;
      }
    } else {
      const legendTitle = store.getters.legendTitle;
      if (legendTitle !== '') {
        title = `${title} - ${legendTitle}`;
      }
    }

    document.title = title;

    // Find old metatags.
    const metaTags = Array.from(document.querySelectorAll('[data-vue-router-controlled]'));

    const newUrl = router.resolve(to).href;

    const metaTagDefinitions = {
      linkCanonical: {
        href: `https://compass.durhamnc.gov${newUrl}`,
      },
      linkEn: {
        href: `https://compass.durhamnc.gov${
          router.resolve({ ...to, params: { ...to.params, locale: 'en' } }).href}`,
      },
      linkEs: {
        href: `https://compass.durhamnc.gov${
          router.resolve({ ...to, params: { ...to.params, locale: 'es' } }).href}`,
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
        content:
        newUrl,
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

    next();
  });
});

/* eslint-disable no-new */
/* eslint-disable no-unused-vars */
const app = new Vue({
  i18n,
  store,
  router,
  el: '#app',
  vuetify,
  data: { loading: true },
  render: h => h(App),
});

Vue.filter('allcaps', (value) => {
  if (!value) return '';
  return String(value).toUpperCase();
});

Vue.filter('capitalize', (value) => {
  if (!value) return '';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
});

// Set string compare function based on locale dynamically.
const stringCompareEn = new Intl.Collator('en').compare;
const stringCompareEs = new Intl.Collator('es').compare;
i18n.localizedStringCompareFn = (a, b) => (i18n.locale === 'es' ? stringCompareEs(a, b) : stringCompareEn(a, b));

// Google analytics
if ('googleAnalyticsId' in config.privateConfig && config.privateConfig.googleAnalyticsId) {
  Vue.use(VueAnalytics, {
    id: config.privateConfig.googleAnalyticsId,
    router,
    debug: {
      sendHitTask: process.env.NODE_ENV === 'production',
    },
  });
}

router.afterEach((to, from, next) => {
  app.loading = false;
});
