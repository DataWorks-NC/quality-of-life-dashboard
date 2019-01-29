import 'babel-polyfill';

import Vuex from 'vuex';
import Vue from 'vue';

import colors from '../modules/breaks';
import siteConfig from '../../../data/config/site';
import dataConfigUnsorted from '../../../data/config/data';
import jenksBreaks from '../modules/jenksbreaks';
import { gaEvent, replaceState } from '../modules/tracking';

const fetchResponseJSON = async (path) => {
  try {
    let response = await fetch(path);
    return await response.json();
  }
  catch (e) {
    return null;
  }
};

const fetchResponseHTML = async (path) => {
  try {
    let response = await fetch(path);
    return await response.text();
  }
  catch (e) {
    return null;
  }
};

Vue.use(Vuex);

// Sort dataConfig alphabetically by metric and category
let dataConfigTemp = [];
for (const key in dataConfigUnsorted) {
  if (dataConfigUnsorted.hasOwnProperty(key)) {
    const t = dataConfigUnsorted[key];
    t._key = key;
    dataConfigTemp.push(t);
  }
}

dataConfigTemp = dataConfigTemp.sort((a, b) => {
  if (a.category > b.category) return 1;
  if (a.category < b.category) return -1;
  if (a.title > b.title) return 1;
  if (a.title < b.title) return -1;
  return 0;
});
const dataConfig = dataConfigTemp.reduce((obj, curVal) => { obj[curVal._key] = curVal; return obj; }, {});
const categories = dataConfigTemp.reduce((categoriesArray, curVal) => { if (categoriesArray.indexOf(curVal.category) === -1) categoriesArray.push(curVal.category); return categoriesArray; }, []);

export default new Vuex.Store({
  state: {
    metric: {
      config: null,
      years: [],
      data: null,
    },
    colors: colors.breaksGnBu5,
    breaks: [0, 0, 0, 0, 0, 0],
    selected: [],
    highlight: [],
    year: null,
    metadata: null,
    zoomNeighborhoods: [],
    metricId: null,
    geography: siteConfig.geographies[0],
    dataConfig: dataConfig,
    categories: categories,
  },
  mutations: {
    clearSelected(state) {
      state.selected = [];
    },
    removeSelectedByPos(state, pos) {
      state.selected.splice(pos, 1);
    },
    setGeographyId(state, newGeographyId) {
      state.geography = siteConfig.geographies.filter(obj => obj.id === newGeographyId);
    },
    setMetricId(state, newMetricId) {
      state.metricId = newMetricId;
    },
    setMetricConfig(state, metricConfig) {
      state.metric = metricConfig;
    },
    setMetricMetadata(state, metadata) {
      state.metadata = metadata;
    },
    setYear(state, year) {
      state.year = year;
    },
    setBreaks(state, breaks) {
      state.breaks = breaks;
    },
  },
  actions: {
    async loadMetricData({ commit, state }) {
      const path = `data/metric/${state.geography.id}/m${state.metricId}.json`;
      console.log(path);
      let metricJSON = await fetchResponseJSON(path);
      let nKeys = Object.keys(metricJSON.map);
      let yKeys = Object.keys(metricJSON.map[nKeys[0]]);
      let years = yKeys.map(function(el) {
        return el.replace('y_', '');
      });

      // drop invalid selected values
      for (let i = 0; i < state.selected.length; i++) {
        if (nKeys.indexOf(state.selected[i]) === -1) {
          commit('removeSelectedByPos', i);
        }
      }
      commit('setMetricConfig', {
        config: dataConfig[`m${state.metricId}`],
        years: years,
        data: metricJSON,
      });
      commit('setYear', years[years.length - 1]);
      commit('setBreaks', jenksBreaks(metricJSON.map, years, nKeys, 5));
    },
    async loadMetricMetadata({ commit, state }) {
      let metricMetadata = await fetchResponseHTML(`/data/meta/m${state.metricId}.html`);
      commit('setMetricMetadata', metricMetadata);
    },
    async setGeography({ commit, dispatch, state }, newGeographyId) {
      console.log('Set Geography');
      commit('setGeographyId', newGeographyId);

    },
    async changeMetric({ commit, dispatch, state }, newMetricId) {
      commit('setMetricId', newMetricId);

      // Check that data exists for this metric & geography, otherwise switch geography.
      if (!state.geography || state.dataConfig[`m${newMetricId}`].geographies.indexOf(state.geography.id) === -1) {
        await dispatch('setGeography', state.dataConfig[`m${newMetricId}`].geographies[0]);
      }

      gaEvent('metric', state.dataConfig[`m${newMetricId}`].title.trim(), state.dataConfig[`m${newMetricId}`].category.trim());
      replaceState(newMetricId, state.selected, state.geography.id);
      return await Promise.all([dispatch('loadMetricData'), dispatch('loadMetricMetadata')]);
    },
  },
});
