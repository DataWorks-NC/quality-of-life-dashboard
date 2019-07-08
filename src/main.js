import Vue from 'vue';

import store from './js/vuex-store';
import router from './js/router';
import i18n from './js/i18n';

import App from './js/App';

import 'mapbox-gl/dist/mapbox-gl.css';
import './css/main.css';

i18n.locale = 'es';

Vue.config.productionTip = false;

// Router navigation guard:
// Handles locale switching and redirecting from root URL to language-specific
// homepage. Also handles setting title & metadata.
router.beforeEach((to, from, next) => {
  // Language handling.
  let language = to.params.locale;
  // Params can't be set on these routes so they need to be set manually
  if (to.name === 'home-es') {
    language = 'es';
  } else if (to.name === 'home-en') {
    // If user was redirected from the root URL, check browser language first.
    if (from.path === '/' && language === 'es') {
      language = navigator.language.toLowerCase().substr(0, 2);
      next('home-es');
    } else {
      language = 'en';
    }
  }

  if (!language) {
    language = i18n.locale;
  } else {
    i18n.locale = language;
  }
  to.params.locale = language;

  // Sync store language setting up with i18n setting so that fresh metadata can be fetched.
  store.dispatch('setLanguage', language).then(next);

  // Set title
  // let title = '';
  // if (to.name.indexOf('home') === 0) {
  //   title = i18n.t(`strings.pageTitles.home`);
  // }
  // else {
  //   title = i18n.t(`strings.pageTitles.${to.name}`, to.params);
  // }
  // if (title.indexOf('strings') === 0) {
  //   title = i18n.t('strings.pageTitles.home');
  // }
  // document.title = title;

  // Set metadata. For now just use a single description for all pages except tracts.

  // Find old metatags.
  // const metaTags = Array.from(document.querySelectorAll('[data-vue-router-controlled]'));
  //
  // let description = i18n.t('strings.pageMetaDescriptions.home');
  // if (to.name === 'infosheet' && store.getters.dataLoaded) {
  //   // Use dynamic tract diabetes data in meta if possible.
  //   // @TODO: Replace this with better text.
  //   description = store.getters.currentTractTitle;
  // }
  //
  // const metaTagDefinitions = {
  //   description: {
  //     content:
  //     description,
  //   },
  //   ogTitle: {
  //     content:
  //     title,
  //   },
  //   ogUrl: {
  //     content:
  //       siteConfig.baseUrl + to.fullPath,
  //   },
  //   ogDescription: {
  //     content:
  //     description,
  //   },
  //   ogType: {
  //     content: to.name === 'infosheet' ? 'article' : 'website',
  //   },
  // };
  //
  // metaTags.map((tag) => {
  //   const tagDef = metaTagDefinitions[tag.getAttribute('data-vue-router-controlled')];
  //   if (!tagDef) { return; }
  //   Object.keys(tagDef).forEach((key) => { tag.setAttribute(key, tagDef[key]); });
  // });
});

Vue.filter('allcaps', (value) => {
  if (!value) return '';
  return String(value).toUpperCase();
});

Vue.filter('capitalize', function (value) {
  if (!value) return '';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
});

/* eslint-disable no-new */
const app = new Vue({
  i18n,
  store,
  router,
  el: '#app',
  render: h => h(App),
});
