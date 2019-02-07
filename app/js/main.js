// __________________________________
//   QoL Dashboard v3               |
//   Tobin Bradley                  |
//   Mecklenburg County GIS         |
// ----------------------------------
//        \   ^__^
//         \  (oo)\_______
//            (__)\       )\/\
//                ||----w |
//                ||     ||
//

import Vue from 'vue';

import Vuex from 'vuex';
import store from './vuex-store';

import 'vueify/lib/insert-css'; // required for .vue file <style> tags

import Dashboard from './Dashboard.vue';
import Sidebar from './components/sidebar.vue';

// to fix vue not including modules bug
import 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder';

Vue.use(Vuex);

Vue.config.productionTip = false;

/* eslint-disable no-new */
const dashboard = new Vue({
  store,
  el: '#dashboard',
  render: h => h(Dashboard),
});

const sidebar = new Vue({
  store,
  el: '#sidebar',
  render: h => h(Sidebar),
});
