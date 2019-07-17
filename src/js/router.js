import Vue from 'vue';
import Router from 'vue-router';

import store from './vuex-store';

import Compass from './Compass';

Vue.use(Router);

const routes = [
  {
    name: 'compass',
    path: '/:locale/compass/:metric/:geography_level/',
    component: Compass,
    beforeEnter(to, from, next) {
      // Note: this code only gets called once when Compass component first loads.
      // Subsequent changes in metric are handled by the beforeRouteUpdate on Compass component.
      if ('selected' in to.query) {
        store.commit('setSelected', to.query.selected);
      }
      store.dispatch('changeMetric', { newMetricId: to.params.metric, newGeographyId: to.params.geography_level }).then(() => {
        if ('selected' in to.query) {
          store.commit('setSelected', to.query.selected);
        }
        if ('mode' in to.query && to.query.mode === 'print') {
          store.commit('setPrintMode', true);
        }
        next();
      });
    },
  },
  {
    path: '/:locale/compass/:metric/',
    Component: Compass,
    beforeEnter(to, from, next) {
      let geography_level = 'tract';
      if ('geography_level' in from.params) {
        geography_level = from.params.geography_level;
      }
      next({ name: 'compass', params: { locale: to.params.locale, metric: to.params.metric, geography_level } });
    },
  },
  {
    path: '/:locale/compass/',
    component: Compass,
    beforeEnter(to, from, next) {
      next({ name: 'compass', params: { locale: to.params.locale, metric: 'POP', geography_level: 'tract' }, replace: true });
    },
  },
  {
    name: 'homepage',
    path: '/:locale/',
    component: Compass,
  },
  {
    name: 'wildcard',
    path: '*',
    redirect: { name: 'homepage', params: { locale: 'en' } }, // TODO: Customize language here possibly.
  },
];

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});
