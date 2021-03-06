import Vuex from 'vuex';
import Vue from 'vue';

import config from '../modules/config';
import jenksBreaks from '../modules/jenksbreaks';
import getSubstringIndex from '../modules/substring-nth';
import { gaEvent } from '../modules/tracking';
import { fetchResponseJSON, fetchResponseHTML } from '../modules/fetch';
import { calcValue, wValsToArray, sum } from '../modules/metric_calculations';

import report from './report';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    report,
  },
  state: {
    metric: { // Currently selected metric
      config: null,
      years: [],
      data: null,
      averageValues: {},
    },
    breaks: [0, 0, 0, 0, 0, 0],
    highlight: [],
    year: null,
    metadata: null,
    metricId: null,
    geography: {
      id: null,
      name: null,
      label: null,
      description: null,
    },
    printMode: false,
    customLegendTitle: '',
    lastCompassRoute: null, // Store the last route used in compass so we can navigate back from report.
  },
  getters: {
    language: ({ route: { params: { locale = 'en ' } } }) => locale,
    selected: ({ route: { query: { selected = [], selectGroupType = null, selectGroupName = null } }, geography = { id: null } }) => {
      if (selected.length) {
        if (!Array.isArray(selected)) {
          return [selected];
        }
        return selected;
      }
      if (selectGroupType && selectGroupName && geography.id in config.selectGroups[selectGroupType] && selectGroupName in config.selectGroups[selectGroupType][geography.id]) {
        return config.selectGroups[selectGroupType][geography.id][selectGroupName];
      }
      return [];
    },
    selectGroupIds: ({ route: { query: { selectGroupType = null, selectGroupName = null } }, geography = { id: null } }) => ((selectGroupType && selectGroupName && geography.id in config.selectGroups[selectGroupType] && selectGroupName in config.selectGroups[selectGroupType][geography.id]) ? config.selectGroups[selectGroupType][geography.id][selectGroupName] : []),
    selectGroupName: ({ route: { query: { selectGroupName = null, selectGroupType = null } }, geography }) => {
      if (selectGroupType && selectGroupName && geography.id in config.selectGroups[selectGroupType] && selectGroupName in config.selectGroups[selectGroupType][geography.id]) return selectGroupName;
      return null;
    },
    selectGroupType: ({ route: { query: { selectGroupName = null, selectGroupType = null } }, geography }) => {
      if (selectGroupType && selectGroupName && geography.id in config.selectGroups[selectGroupType] && selectGroupName in config.selectGroups[selectGroupType][geography.id]) return selectGroupType;
      return null;
    },
    legendTitle: ({
      customLegendTitle = false, metric, route: { params: { locale = 'en ' } }, year,
    }) => {
      if (customLegendTitle) return customLegendTitle;
      if (metric.config) return `${locale === 'es' ? metric.config.title_es : metric.config.title}, ${year}`;
      return '';
    },
    metadataImportant: (state) => (state.metadata ? state.metadata.substring(getSubstringIndex(state.metadata, '</h3>', 1) + 5, getSubstringIndex(state.metadata, '<h3', 2)) : ''),
    metadataImportantForHeader: (state, getters) => {
      if (getters.metadataImportant) {
        const doc = new DOMParser().parseFromString(getters.metadataImportant, 'text/html');
        return doc.body.textContent || '';
      }
      return '';
    },
    metadataResources: (state) => (state.metadata ? state.metadata.substring(getSubstringIndex(state.metadata, '</h3>', 3) + 5, state.metadata.length).replace(/<table/g, '<table class="meta-table table"') : ''),
    metadataAbout: (state) => (state.metadata ? state.metadata.substring(getSubstringIndex(state.metadata, '</h3>', 2) + 5, getSubstringIndex(state.metadata, '<h3', 3)) : ''),
  },
  mutations: {
    setGeographyId(state, newGeographyId) {
      if (state.geography.id) {
        // state.selected = []; TODO: Rewrite this.
        state.highlight = [];
      }

      if (state.geography.id !== newGeographyId) {
        state.geography = config.siteConfig.geographies.find(
          (obj) => obj.id === newGeographyId,
        );

        Object.freeze(state.geography);
      }
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
    setBreaks(state, breaks) {
      state.breaks = Object.freeze(breaks);
    },
    setHighlight(state, highlight) {
      state.highlight = highlight;
    },
    setPrintMode(state, printMode = true) {
      state.printMode = printMode;
      if (!printMode) state.customLegendTitle = false;
    },
    setLegendTitle(state, title) {
      state.customLegendTitle = title;
    },
    clearMetric(state) {
      state.metricId = null;
      state.metric = { // Currently selected metric
        config: null,
        years: [],
        data: null,
        averageValues: {},
      };
      state.metadata = null;
    },
    setLastCompassRoute(state, route) {
      state.lastCompassRoute = route;
    },
  },
  actions: {
    async loadMetricData({ commit, state }) {
      // TODO: Cache this result.
      const path = `/data/metric/${state.geography.id}/m${state.metricId}.json`;
      const metricJSON = await fetchResponseJSON(path);
      const nKeys = Object.keys(metricJSON.map);
      const yKeys = Object.keys(metricJSON.map[nKeys[0]]);
      const years = yKeys.map(el => el.replace('y_', ''));

      // drop invalid selected values
      // TODO: is this even needed?
      // const selected = state.selected.filter(id => nKeys.indexOf(id) > 0);
      // if (selected.length !== state.selected.length) {
      //   commit('setSelected', selected);
      // }

      // Calculate average values.
      const metricConfig = config.dataConfig[`m${state.metricId}`];
      const keys = Object.keys(metricJSON.map);
      const averageValues = {};
      years.forEach((year) => {
        let areaValue = null;
        let areaValueRaw = null;
        if (metricConfig.world_val
            && metricConfig.world_val[`y_${year}`]) {
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
        years,
        data: metricJSON,
        averageValues,
      });
      commit('setYear', years[years.length - 1]);
      commit('setBreaks', jenksBreaks(metricJSON.map, years, nKeys, 5));
    },
    async loadMetricMetadata({ commit, state }) {
      if (state.metricId) {
        const metricMetadata = await fetchResponseHTML(
          `/data/meta/${state.route.params.locale}/m${state.metricId}.html`,
        );
        commit('setMetricMetadata', metricMetadata);
      }
    },

    // In contrast to the mutation function by the same name, this checks to see if new data also needs to be loaded.
    async setGeographyId({ commit, dispatch, state }, newGeographyId) {
      if (state.geography.id === newGeographyId) return;
      commit('setGeographyId', newGeographyId);
      return dispatch('loadMetricData');
    },

    async changeMetric({ commit, dispatch, state }, params) {
      // Validate geography ID in params and set it to a default if it is invalid.
      if (!('newGeographyId' in params) || config.dataConfig[`m${params.newMetricId}`].geographies.indexOf(params.newGeographyId) === -1) {
        params.newGeographyId = config.dataConfig[`m${params.newMetricId}`].geographies[0];
      }

      let geographyChanged = false;
      if (params.newGeographyId !== state.geography.id) {
        commit('setGeographyId', params.newGeographyId);
        geographyChanged = true;
      }

      if (state.metricId !== params.newMetricId) {
        commit('setMetricId', params.newMetricId);
        gaEvent('metric',
          config.dataConfig[`m${params.newMetricId}`].title.trim(),
          config.dataConfig[`m${params.newMetricId}`].category.trim());
        // Only load metadata if the metric has changed.
        return Promise.all([dispatch('loadMetricData'), dispatch('loadMetricMetadata')]);
      }

      if (geographyChanged) {
        return dispatch('loadMetricData');
      }
    },
  },
});
