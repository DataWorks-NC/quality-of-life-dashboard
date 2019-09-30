import "@babel/polyfill";

import Vue from 'vue';

import Vuex from 'vuex';
import store from './vuex-store';
import i18n from '../lang/lang';

import 'vueify/lib/insert-css'; // required for .vue file <style> tags

import embed from './views/Embed.vue';

// to fix vue not including modules bug
import 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder';

Vue.use(Vuex);

Vue.config.productionTip = false;

/* eslint-disable no-new */
const embedMap = new Vue({
  i18n,
  store,
  el: '#embed-map',
  render: h => h(embed),
});
