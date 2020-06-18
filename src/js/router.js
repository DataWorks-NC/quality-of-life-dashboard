import Vue from 'vue';
import Router from 'vue-router';

import store from './vuex-store';
import config from './modules/config';

const About = () => import(/* webpackChunkName: "about" */ './views/About');
const Compass = () => import(/* webpackChunkName: "compass" */ './views/Compass');
const Report = () => import(/* webpackChunkName: "report" */'./views/Report');
const Embed = () => import(/* webpackChunkName: "embed" */'./views/Embed');

Vue.use(Router);

const routes = [
  {
    name: 'compass',
    path: '/:locale/compass/:metric/:geographyLevel/',
    component: Compass,
  },
  {
    name: 'report',
    path: '/:locale/report/:geographyLevel/',
    component: Report,
  },
  {
    path: '/:locale/compass/:metric/',
    component: Compass,
    beforeEnter(to, from, next) {
      let geographyLevel = 'tract';
      if ('geographyLevel' in from.params) {
        geographyLevel = from.params.geographyLevel;
      }
      next({ name: 'compass', params: { locale: to.params.locale, metric: to.params.metric, geographyLevel } });
    },
  },
  {
    name: 'embed',
    path: '/:locale/embed/:metric/:geographyLevel/',
    component: Embed,
  },
  {
    name: 'about',
    path: '/:locale/about/',
    component: About,
    beforeEnter(to, from, next) {
      store.commit('clearMetric');
      next();
    },
  },
  {
    name: 'homepage',
    path: '/:locale/',
    component: Compass,
    beforeEnter(to, from, next) {
      store.commit('clearMetric');
      next();
    },
  },
  {
    name: 'wildcard',
    path: '*',
    redirect: { name: 'homepage', params: { locale: 'en' } }, // TODO: Customize language here possibly.
  },
];

const router = new Router({
  mode: 'history',
  encodeQuery: true,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { selector: to.hash, offset: { x: 0, y: 60 } };
    } if (savedPosition) {
      return savedPosition;
    }
    return { x: 0, y: 0 };
  },
});

// Validate params.
// TODO: Make these dynamically pull valid values from config.
router.beforeEach((to, from, next) => {
  // eslint-disable-next-line no-undef
  app.loading = true; // will be defined in main.js.
  if (to.params.locale && ['en', 'es'].indexOf(to.params.locale) === -1) {
    next({ ...to, params: { ...to.params, locale: 'en' } });
  } else if (to.params.geographyLevel && ['blockgroup', 'tract'].indexOf(to.params.geographyLevel) === -1) {
    next({ ...to, params: { ...to.params, geographyLevel: 'tract' } });
  } else if (to.params.metric && !(`m${to.params.metric}` in config.dataConfig)) {
    next({ name: 'homepage', params: { locale: ('locale' in to.params) ? to.params.locale : 'en' } });
  } else {
    next();
  }
});

// Load geography & selected on each route.
router.beforeEach((to, from, next) => {
  if (to.name === 'report' && to.params.geographyLevel !== store.state.geography.id) {
    store.commit('setGeographyId', to.params.geographyLevel);
  }

  if ('mode' in to.query && to.query.mode === 'print') {
    store.commit('setPrintMode', true);
  } else if (store.state.printMode) {
    store.commit('setPrintMode', false);
  }

  // For compass routes only, load metric and set print mode.
  if ('metric' in to.params && 'geographyLevel' in to.params && (to.params.geographyLevel !== store.state.geography.id || store.state.metricId !== to.params.metric)) {
    return store.dispatch('changeMetric', {
      newMetricId: to.params.metric,
      newGeographyId: to.params.geographyLevel,
    }).then(() => {
      next();
    });
  }

  if (to.name === 'report') {
    if (!Object.keys(store.state.report.metrics).length || to.params.geographyLevel !== store.state.geography.id) {
      store.commit('populateMetrics', { geography: store.state.geography });
    }

    if ('visibleCategories' in to.query || 'visibleMetrics' in to.query) {
      store.commit('hideAllMetrics');
      if ('visibleCategories' in to.query) {
        [].concat(to.query.visibleCategories).forEach((category) => {
          store.commit('toggleCategory', { categoryName: category, visibility: true });
        });
      }
      if ('visibleMetrics' in to.query) {
        [].concat(to.query.visibleMetrics).forEach((metric) => {
          // TODO: Flag to make usage of m prefix consistent.
          store.commit('toggleMetric', { metricId: `m${metric}`, visibility: true });
        });
      }
    } else {
      store.commit('showAllMetrics');
    }

    if (!Object.keys(store.state.report.metricValues).length) {
      // TODO: Call this when selection changes.
      return store.dispatch('loadData').then(() => {
        next();
      });
    }
  }

  return next();
});

// Check that URL params match current state; in case the geography level has changed.
router.beforeEach((to, from, next) => {
  if (from.name === 'compass' && to.name !== 'compass') {
    store.commit('setLastCompassRoute', from);
  }

  if ('legendTitle' in to.query) {
    store.commit('setLegendTitle', to.query.legendTitle);
  } else if (store.state.customLegendTitle !== '') {
    store.commit('setLegendTitle', '');
  }

  const newTo = { ...to };
  let toChanged = false; // Don't fire next() with a new to object unless something has changed!
  if (store.state.geography.id !== to.params.geographyLevel) {
    toChanged = true;
    newTo.params = { ...newTo.params, geographyLevel: store.state.geography.id };
    newTo.query = { ...newTo.query, selected: [] };
  }
  if (toChanged) {
    return next(newTo);
  }
  next();
});

export default router;
