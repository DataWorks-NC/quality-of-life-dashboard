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

import axios from 'axios';
import querystring from 'querystring';
import dataConfigUnsorted from '../../data/config/data';
import mapConfig from '../../data/config/map';
import selectGroups from '../../data/config/selectgroups';
import siteConfig from '../../data/config/site';
import privateConfig from '../../data/config/private';
import colors from './modules/breaks';
import fetchData from './modules/fetch';
import {
  replaceState,
  gaEvent,
  getHash,
  urlArgsToHash,
} from './modules/tracking';
import scrollTo from './modules/scrollto';
import ieSVGFixes from './modules/ie-svg-bugs.js';
import Vuex from 'vuex';
import store from './vuex-store';

import 'vueify/lib/insert-css'; // required for .vue file <style> tags

import Dashboard from './Dashboard.vue'

// to fix vue not including modules bug
import 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder';
Vue.use(Vuex);

require('es6-promise').polyfill(); // Fix for axios on IE11
require('./modules/ie-polyfill-array-from.js'); // fix for array from on IE11
require('material-design-lite');

Vue.config.productionTip = false;

// fix ie SVG bugs
ieSVGFixes();

// reset old GET args to hash
urlArgsToHash();

/* eslint-disable no-new */
const dashboard = new Vue({
  store,
  el: '#dashboard',
  render: h => h(Dashboard),
});
