import Vuex from 'vuex';
import Vue from 'vue';

import config from '../modules/config';
import jenksBreaks from '../modules/jenksbreaks';
import { gaEvent } from '../modules/tracking';
import { fetchResponseJSON, fetchResponseHTML } from '../modules/fetch';
import { calcValue, wValsToArray, sum } from '../modules/metric_calculations';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    metric: { // Currently selected metric
      config: null,
      years: [],
      data: null,
      averageValues: {},
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
    printMode: false,
    customLegendTitle: '',
    language: 'en'
  },
  getters: {
    reportUrl: state => '',
    embedUrl: state => '',
    legendTitle: state => {
      if (state.customLegendTitle) return state.customLegendTitle;
      else if (state.metric.config) return state.metric.config.title + ', ' + state.year;
      return '';
    },
    urlHash: state => {
      if (!state.metricId || !state.geography.id) return '';
      return `${state.printMode ? 'print/' : ''}${state.metricId}/${state.geography.id}/${state.selected.map(g => encodeURIComponent(g)).join(',')}`;
    },
  },
  mutations: {
    setSelected(state, geographyIds) {
      if (geographyIds instanceof Array) {
        state.selected = geographyIds;
      } else {
        state.selected = [].concat(geographyIds);
      }
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
            obj => obj.id === newGeographyId
        );
        // TODO: Handle null values here.
        Object.freeze(state.geography);
        state.selected = [];
        state.highlight = [];
      }
    },
    setLanguage(state, language) {
      state.language = language;
    },
    setMetricId(state, newMetricId) {
      state.metricId = newMetricId;
    },
    setMetric(state, metric) {
      state.metric = metric;
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
    setPrintMode(state, printMode = true) {
      state.printMode = printMode;
      if (!printMode) state.customLegendTitle = false;
    },
    setCustomLegendTitle(state, title) {
      state.customLegendTitle = title;
    },
  },
  actions: {
    async loadMetricData({ commit, state }) {
      // TODO: Cache this result.
      const path = `/data/metric/${state.geography.id}/m${state.metricId}.json`;
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

      // Calculate average values.
      const metricConfig = config.dataConfig[`m${state.metricId}`];
      const keys = Object.keys(metricJSON.map);
      const averageValues = {};
      years.forEach(year => {
        let areaValue = null;
        let areaValueRaw = null;
        if (metricConfig.world_val &&
            metricConfig.world_val[`y_${year}`]) {
          areaValue = metricConfig.world_val[`y_${year}`];
        } else {
          areaValue = calcValue(metricJSON, metricConfig.type, year, keys);
        }
        if (metricConfig.raw_label) {
          const rawArray = wValsToArray(metricJSON.map,
              metricJSON.w, [year], keys);
          let rawValue = sum(rawArray);
          if (metricConfig.suffix === '%') {
            rawValue /= 100;
          }
          areaValueRaw = rawValue;
        }
        averageValues[year] = { value: areaValue, rawValue: areaValueRaw };
      });

      commit('setMetric', {
        config: config.dataConfig[`m${state.metricId}`],
        years: years,
        data: metricJSON,
        averageValues: averageValues,
      });
      commit('setYear', years[years.length - 1]);
      commit('setBreaks', jenksBreaks(metricJSON.map, years, nKeys, 5));
    },
    async setLanguage({ commit, dispatch, state }, newLanguage) {
      if (newLanguage === state.language) {
        return;
      }
      // TODO: Check that language code is valid.

      return await dispatch('loadMetricMetadata');
    },
    async loadMetricMetadata({ commit, state }) {
      let metricMetadata = await fetchResponseHTML(`/data/meta/${state.language}/m${state.metricId}.html`);
      commit('setMetricMetadata', metricMetadata);
    },

    // In contrast to the mutation function by the same name, this checks to see if new data also needs to be loaded.
    async setGeographyId({ commit, dispatch, state }, newGeographyId) {
      if (state.geography.id === newGeographyId) return;
      commit('setGeographyId', newGeographyId);
      return await dispatch('loadMetricData');
    },

    async changeMetric({ commit, dispatch, state }, params) {
      if (!('newGeographyId' in params) || config.dataConfig[`m${params.newMetricId}`].geographies.indexOf(params.newGeographyId) === -1) {
        commit('setGeographyId', config.dataConfig[`m${params.newMetricId}`].geographies[0]);
      } else if (params.newGeographyId !== state.geography.id) {
        commit('setGeographyId', params.newGeographyId);
      }

      if (state.metricId === params.newMetricId) return;

      commit('setMetricId', params.newMetricId);
      gaEvent('metric', config.dataConfig[`m${params.newMetricId}`].title.trim(), config.dataConfig[`m${params.newMetricId}`].category.trim());
      return await Promise.all([ dispatch('loadMetricData'), dispatch('loadMetricMetadata') ]);
    },

    // Set a random metric.
    async randomMetric({ dispatch }) {
      const metricIds = Object.keys(config.dataConfig);
      const metric = config.dataConfig[metricIds[Math.floor(Math.random() * (metricIds.length + 1))]];
      return await dispatch('changeMetric', { newMetricId: metric.metric });
    },
    async playYearAnimation({ commit, state }) {
      // set current index and advance one
      commit('setAnimationHandler', {
        playing: true,
        currentIndex: state.metric.years.indexOf(state.year),
        interval: setInterval(function() {
          commit('nextYear');
        }, 1750),
      });
      commit('nextYear');
    },
    async stopYearAnimation({ commit, state}) {
      if (state.yearAnimationHandler) {
        clearInterval(state.yearAnimationHandler.interval);
        commit('setAnimationHandler', null);
      }
    },
  },
});
