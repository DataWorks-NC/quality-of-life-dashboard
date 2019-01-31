import 'babel-polyfill';

import Vuex from 'vuex';
import Vue from 'vue';

import _ from 'lodash';

import colors from '../modules/breaks';
import mapConfig from '../../../data/config/map';
import siteConfig from '../../../data/config/site';
import dataConfigUnsorted from '../../../data/config/data';
import privateConfig from '../../../data/config/private';
import selectGroups from '../../../data/config/selectgroups';
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

const metricsByCategory = _.fromPairs(
    categories.map(
        (category) => [category, Object.values(dataConfig).filter(metric => metric.category === category)]
    )
);


export default new Vuex.Store({
  state: {
    metric: { // Currently selected metric
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
    selectGroupName: null,
    geography: siteConfig.geographies[0],
    dataConfig: dataConfig, // Object where keys are metric IDs and values are config for that metric.
    mapConfig: mapConfig,
    privateConfig: privateConfig,
    siteConfig: siteConfig,
    selectGroups: selectGroups,
    categories: categories, // List of category names only
    metricsByCategory: metricsByCategory, // Object where keys are category names and properties are metrics within that category.
  },
  getters: {
    reportUrl: state => `${state.siteConfig.qolreportURL}#${state.geography.id}/${state.selected.map(g => encodeURIComponent(g)).join(',')}${state.selectGroupName ? `/${state.selectGroupName}` : ''}`,
    embedUrl: state => `${state.siteConfig.qolembedURL}?m=${state.metricId}&y=${state.year}&s=${state.selected.join(',')}`,
  },
  mutations: {
    clearSelected(state) {
      state.selected = [];
    },
    setSelected(state, geographyIds) {
      state.selected = geographyIds;
    },
    addToSelected(state, geographyId) {
      state.selected.push(geographyId);
    },
    removeSelectedByPos(state, pos) {
      state.selected.splice(pos, 1);
    },
    setGeographyId(state, newGeographyId) {
      state.geography = siteConfig.geographies.find(obj => obj.id === newGeographyId);
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
    setHighlight(state, highlight) {
      state.highlight = highlight;
    },
    setSelectGroupName(state, newName) {
      state.selectGroupName = newName;
    },
    setZoomNeighborhoods(state, neighborhoods) {
      state.zoomNeighborhoods = neighborhoods;
    }
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

      // TODO remove this test
      commit('setSelected', Object.keys(metricJSON.map).slice(0,2));
    },
    async loadMetricMetadata({ commit, state }) {
      let metricMetadata = await fetchResponseHTML(`/data/meta/m${state.metricId}.html`);
      commit('setMetricMetadata', metricMetadata);
    },
    async setGeography({ commit, dispatch, state }, newGeographyId) {
      console.log('Set Geography');
      commit('setGeographyId', newGeographyId);
      // TODO!!!
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
    clearSelected({ commit , state }) {
      commit('clearSelected');
      replaceState(state.metricId, [], state.geography.id);
    },
    async playYearAnimation({ commit, state }) {
      // TODO
      console.log('Start animation');
      // let _this = this;
      // const checked = $event.target.checked;
      //
      // if (!checked) {
      //   // set current index and advance one
      //   let i = _this.metric.years.indexOf(_this.sharedState.year) + 1;
      //   i >= _this.metric.years.length ? i = 0 : null;
      //   _this.$store.commit('setYear', _this.metric.years[i]);
      //
      //   _this.privateState.playToggle = setInterval(function() {
      //     // begin the loop
      //     i++;
      //     if (i >= _this.sharedState.metric.years.length) {
      //       i = 0;
      //     }
      //     _this.sharedState.year = _this.sharedState.metric.years[i];
      //   }, 1500);
      // } else {
      //   // end loop
      // }
    },
    async stopYearAnimation({ commit, state}) {
      // TODO
      console.log('Stop animation');
    }
  },
});
