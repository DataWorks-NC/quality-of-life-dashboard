import Vue from 'vue';
import VueAnalytics from 'vue-analytics';

import vueScrollto from 'vue-scrollto';
import VueObserveVisibility from 'vue-observe-visibility';
import store from './js/vuex-store';
import router from './js/router';
import i18n from './js/i18n';
import vuetify from './plugins/vuetify';

import App from './js/App.vue';

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
    let description = i18n.t('strings.about');

    if (to.name === 'report') {
      const reportTitle = store.getters.reportTitle;
      if (reportTitle !== '') {
        title = `${title} - ${reportTitle}`;
        description = i18n.t('strings.metaDescriptionReport', { area: reportTitle });
      }
    } else {
      const legendTitle = store.getters.legendTitle;
      if (legendTitle !== '') {
        const metricTitle = i18n.locale === 'es' ? store.state.metric.config.title_es : store.state.metric.config.title;
        const geographyName = store.state.geography.id && store.state.geography.id.length > 0 ? i18n.t(`geographies.${store.state.geography.id}.name`) : '';

        description = `${i18n.t('strings.metaDescriptionMetric', { metric: metricTitle.toLocaleLowerCase(i18n.locale), geography: geographyName.toLocaleLowerCase(i18n.locale) })} ${store.getters.metadataImportantForHeader}`;
        title = `${title} - ${legendTitle}${geographyName !== '' ? ` (${geographyName})` : ''}`;
        if (store.state.printMode === true) {
          title = `${title} - ${i18n.t('undermapButtons.printEmbed')}`;
          description = `${i18n.t('strings.metaDescriptionPrint', { metric: metricTitle.toLocaleLowerCase(i18n.locale), geography: geographyName.toLocaleLowerCase(i18n.locale) })} ${store.getters.metadataImportantForHeader}`;
        }
      }
    }

    document.title = title;

    // Find old metatags.
    const metaTags = Array.from(document.querySelectorAll('[data-vue-router-controlled]'));

    const newUrl = router.resolve(to).href;

    const metaTagDefinitions = {
      linkCanonical: {
        href: `${process.env.VUE_APP_BASE_URL}${newUrl}`,
      },
      linkEn: {
        href: `${process.env.VUE_APP_BASE_URL}${
          router.resolve({ ...to, params: { ...to.params, locale: 'en' } }).href}`,
      },
      linkEs: {
        href: `${process.env.VUE_APP_BASE_URL}${
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
        content: `${process.env.VUE_APP_BASE_URL}${newUrl}`,
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

Vue.use(vueScrollto);
Vue.use(VueObserveVisibility);

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
if (process.env.VUE_APP_GOOGLE_ANALYTICS_ID) {
  Vue.use(VueAnalytics, {
    id: process.env.VUE_APP_GOOGLE_ANALYTICS_ID,
    router,
    debug: {
      sendHitTask: process.env.NODE_ENV === 'production',
    },
  });
}

router.afterEach((to, from, next) => {
  app.loading = false;
});
