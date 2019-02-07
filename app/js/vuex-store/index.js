import 'babel-polyfill';

import Vuex from 'vuex';
import Vue from 'vue';

import config from '../modules/config';
import jenksBreaks from '../modules/jenksbreaks';
import { gaEvent } from '../modules/tracking';

const jsonCache = {};
const htmlCache = {};

const fetchResponseJSON = async (path) => {
  if (jsonCache[path]) {
    return jsonCache[path];
  }
  try {
    let response = await fetch(path);
    return jsonCache[path] = await response.json();
  }
  catch (e) {
    return null;
  }
};

const fetchResponseHTML = async (path) => {
  if (htmlCache[path]) {
    return htmlCache[path];
  }
  try {
    let response = await fetch(path);
    return htmlCache[path] = await response.text();
  }
  catch (e) {
    return null;
  }
};

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    metric: { // Currently selected metric
      config: null,
      years: [],
      data: null,
    },
    breaks: [0, 0, 0, 0, 0, 0],
    selected: [],
    highlight: [],
    year: null,
    yearAnimationHandler: { // Object to keep track of various aspects related to the year animation.
      interval: null,
      currentIndex: null,
      playing: false,
    },
    metadata: null,
    zoomNeighborhoods: [],
    metricId: null,
    selectGroupName: null,
    geography: {
      id: null,
      name: null,
      label: null,
      description: null,
    },

    // Bounds object for each geography.
    // Each bounds object has keys which are feature ids, and values which are MapBoxGL boundslike objects for the rectangular bounds of that geography.
    geographyBounds: {},
  },
  getters: {
    reportUrl: state => `${config.siteConfig.qolreportURL}#${state.geography.id}/${state.selected.map(g => encodeURIComponent(g)).join(',')}${state.selectGroupName ? `/${state.selectGroupName}` : ''}`,
    embedUrl: state => `${config.siteConfig.qolembedURL}?m=${state.metricId}&y=${state.year}&s=${state.selected.join(',')}`,
    geographyBounds: state => state.geographyBounds[state.geography.id],
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
      if (state.geography.id !== newGeographyId) {
        state.geography = config.siteConfig.geographies.find(
            obj => obj.id === newGeographyId);
        Object.freeze(state.geography);
        state.selected = [];
        state.highlight = [];
      }
    },
    setMetricId(state, newMetricId) {
      state.metricId = newMetricId;
    },
    setMetricConfig(state, metricConfig) {
      state.metric = metricConfig;
      Object.freeze(state.metric);
    },
    setMetricMetadata(state, metadata) {
      state.metadata = metadata;
      Object.freeze(state.metadata);
    },
    setYear(state, year) {
      state.year = year;
    },
    nextYear(state) {
      // Increment year. Used to handle animating the year.
      state.yearAnimationHandler.currentIndex++;
      if (state.yearAnimationHandler.currentIndex >= state.metric.years.length) {
        state.yearAnimationHandler.currentIndex = 0;
      }
      state.year = state.metric.years[state.yearAnimationHandler.currentIndex];
    },
    setAnimationHandler(state, handler) {
      if (!handler) {
        state.yearAnimationHandler = {
          interval: null,
          currentIndex: null,
          playing: false,
        };
      }
      else {
        state.yearAnimationHandler = handler;
      }
    },
    setBreaks(state, breaks) {
      state.breaks = Object.freeze(breaks);
    },
    setHighlight(state, highlight) {
      state.highlight = highlight;
    },
    setSelectGroupName(state, newName) {
      state.selectGroupName = newName;
    },
    setZoomNeighborhoods(state, neighborhoods) {
      state.zoomNeighborhoods = neighborhoods;
    },
    setGeographyBounds(state, params) {
      Vue.set(state.geographyBounds, params.id, params.bounds);
      Object.freeze(state.geographyBounds[params.id]);
    }
  },
  actions: {
    async loadMetricData({ commit, state }) {
      // TODO: Cache this result.
      const path = `data/metric/${state.geography.id}/m${state.metricId}.json`;
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
        config: config.dataConfig[`m${state.metricId}`],
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

    // In contrast to the mutation function by the same name, this checks to see if new data also needs to be loaded.
    async setGeographyId({ commit, dispatch }, newGeographyId) {
      commit('setGeographyId', newGeographyId);
      return Promise.all([ dispatch('loadMetricData'), dispatch('loadGeographyBounds', newGeographyId) ]);
    },

    // Load a single geography bounds file.
    async loadGeographyBounds({ state, commit }, geographyId) {
      if (!geographyId) geographyId = state.geography.id;

      const bounds = await fetchResponseJSON(`data/${geographyId}.bounds.json`);
      return commit('setGeographyBounds', { id: geographyId, bounds: bounds });
    },

    async changeMetric({ commit, dispatch, state }, newMetricId) {
      commit('setMetricId', newMetricId);

      // Check that data exists for this metric & geography, otherwise switch geography.
      if (!state.geography.id || config.dataConfig[`m${newMetricId}`].geographies.indexOf(state.geography.id) === -1) {
        commit('setGeographyId', config.dataConfig[`m${newMetricId}`].geographies[0]);
      }

      gaEvent('metric', config.dataConfig[`m${newMetricId}`].title.trim(), config.dataConfig[`m${newMetricId}`].category.trim());
      return await Promise.all([ dispatch('loadMetricData'), dispatch('loadMetricMetadata') ]);
    },

    // Set a random metric.
    async randomMetric({ dispatch, state }) {
      const metricIds = Object.keys(config.dataConfig);
      const metric = config.dataConfig[metricIds[Math.floor(Math.random() * (metricIds.length + 1))]];
      return await dispatch('changeMetric', metric.metric);
    },
    clearSelected({ commit , state }) {
      commit('clearSelected');
    },
    async playYearAnimation({ commit, state }) {
      // set current index and advance one
      commit('setAnimationHandler', {
        playing: true,
        currentIndex: state.metric.years.indexOf(state.year),
        interval: setInterval(function() {
          commit('nextYear');
        }, 1750)
      });
      commit('nextYear');
    },
    async stopYearAnimation({ commit, state}) {
      if (state.yearAnimationHandler) {
        clearInterval(state.yearAnimationHandler.interval);
        commit('setAnimationHandler', null);
      }
    }
  },
});
