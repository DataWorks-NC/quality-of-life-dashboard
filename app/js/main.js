import "@babel/polyfill";

import Vue from 'vue';

import Vuex from 'vuex';
import store from './vuex-store';

import 'vueify/lib/insert-css'; // required for .vue file <style> tags

import Dashboard from './Dashboard.vue';
import Sidebar from './components/sidebar.vue';
import i18n from '../lang/lang.js';

// to fix vue not including modules bug
import 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder';

Vue.use(Vuex);

Vue.config.productionTip = false;

Vue.filter('allcaps', (value) => {
  if (!value) return '';
  return String(value).toUpperCase();
});

Vue.filter('capitalize', function (value) {
  if (!value) return '';
  return string(value).charAt(0).toUpperCase() + string(value).slice(1);
});

/* eslint-disable no-new */
const sidebar = new Vue({
  i18n,
  store,
  el: '#sidebar',
  render: h => h(Sidebar),
});

/* eslint-disable no-new */
const dashboard = new Vue({
  i18n,
  store,
  el: '#dashboard',
  render: h => h(Dashboard),
});
