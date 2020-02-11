import Vue from 'vue';
import md5 from 'js-md5';
import { fetchResponseJSON } from '../modules/fetch';
import config from '../modules/config';

const { siteConfig, dataConfig } = config;

const getJSONFilename = (geographyId, areaId) => (geographyId === 'neighborhood' ? `/data/report/${geographyId}/${md5(areaId)}.json` : `/data/report/${geographyId}/${areaId}.json`);

export default {
  state: {
    categoryNames: new Array(...new Set(Object.values(dataConfig).map(m => (m.category)))),
    metrics: {}, // Config values for each metric which is in the current geography, plus new visibility flag. Keyed by metric ID.
    reportTitle: false, // Custom title for report.
    metricValues: {}, // Values for each metric in the report.
    countyAverages: {},
    activeCategory: '',
  },
  getters: {
    categoryNames: state => state.categoryNamesBase.filter(c => (c in state.metricValues || c in state.countyAverages)),
    areaNames: (state, getters, rootState) => rootState.selected.map(id => (rootState.language === 'es' ? rootState.geography.label_es(id) : rootState.geography.label(id))),
    // Returns true iff all metrics are visible.
    everythingVisible: state => Object.values(state.metrics).every(m => m.visible),
    visibleCategories: (state, getters) => getters.categoryNames.filter(c => (c in state.metricValues || c in state.countyAverages) && Object.values(state.metrics).some(m => m.category === c && m.visible)),

    // Utility function for setting the query string, returns any categories which are 100% shown.
    totallyVisibleCategories: (state, getters) => getters.visibleCategories.filter(c => Object.values(state.metrics).filter(m => m.category === c).every(m => m.visible)),
    // Utility function for setting the query string, returns only the IDs of metrics which are visible but for which the whole category is not visible.
    visibleMetricsInMixedCategories: (state, getters) => {
      const { totallyVisibleCategories } = getters;
      return Object.values(state.metrics).filter(m => totallyVisibleCategories.indexOf(m.category) === -1 && m.visible).map(m => m.metric);
    },

    hiddenCategories: (state, getters) => getters.categoryNames.filter(c => Object.values(state.metrics).some(m => m.category === c) && !Object.values(state.metrics).filter(m => m.category === c).some(m => m.visible)),

    reportTitle: (state, getters) => (state.reportTitle ? state.reportTitle : getters.areaNames.join(', ')),

    // Pull the most recent year for each metric listed in siteConfig.summaryMetrics for which we have valid metric values.
    summaryMetrics: (state) => {
      const valuesSource = Object.keys(state.metricValues).length ? state.metricValues : state.countyAverages;
      return siteConfig.summaryMetrics.map((id) => {
        if (!(id in dataConfig)) return [];
        const metric = dataConfig[id];
        if (metric.category in valuesSource && metric.metric in valuesSource[metric.category]) {
          metric.value = Object.values(valuesSource[metric.category][metric.metric]).slice(-1)[0];
        }
        return metric;
      });
    },
    activeCategory: state => state.activeCategory,
  },
  mutations: {
    // Populate metrics array on report data, which tracks visibility as well.
    populateMetrics(state, { geography }) {
      const geographyMetrics = Object.keys(dataConfig).filter(m => dataConfig[m].geographies.indexOf(geography.id) > -1);
      geographyMetrics.forEach(m => Vue.set(state.metrics, m, Object.assign({ visible: true }, dataConfig[m])));
    },

    setReportTitle(state, title) {
      state.reportTitle = title;
    },

    // Hide all metrics, so that we can individually toggle on specific metrics/categories.
    hideAllMetrics(state) {
      Object.values(state.metrics).forEach((m) => { m.visible = false; });
    },

    // Show all metrics.
    showAllMetrics(state) {
      Object.values(state.metrics).forEach((m) => { m.visible = true; });
    },

    // Turn on or off all metrics within a particular category.
    toggleCategory(state, { categoryName, visibility }) {
      Object.keys(state.metrics).forEach((m) => {
        if (state.metrics[m].category === categoryName) {
          state.metrics[m].visible = visibility;
        }
      });
    },

    toggleMetric(state, { metricId, visibility }) {
      if (metricId in state.metrics) {
        state.metrics[metricId].visible = visibility;
      }
    },

    // Metric is the ID of a metric, without the 'm' prefix. Values is an object mapping years to data values.
    setMetricValues(state, { metric, values }) {
      const metricConfig = dataConfig[`m${metric}`];
      if (!(metricConfig.category in state.metricValues)) {
        Vue.set(state.metricValues, metricConfig.category, {});
      }
      Vue.set(state.metricValues[metricConfig.category], metric, values);
    },
    setCountyAverages(state, countyAverages) {
      state.countyAverages = countyAverages;
    },
    setActiveCategory(state, category) {
      state.activeCategory = category;
    },
  },
  actions: {
    // Load data first (from individual JSONs, one for each area included in the report, then set area IDs.
    async loadAreaData({ commit, rootState }) {
      if (!rootState.selected.length) { return; }

      // TODO: Only reload area data when necessary.
      const { selected } = rootState;
      // Load array of JSON file data for each metric.
      // eslint-disable-next-line consistent-return
      return Promise.all(selected.map(id => fetchResponseJSON(getJSONFilename(rootState.geography.id, id)))).then((areaData) => {
        // Only examine metrics for which we have proper config. First key in the datafile format is geography_name, so skip that one too.
        const metricsToLoad = Object.keys(areaData[0]).filter(key => key !== 'geography_name' && (`m${key}` in dataConfig));

        metricsToLoad.forEach((key) => {
          const metric = dataConfig[`m${key}`];
          const metricValues = {};

          // Pull list of years to load for this metric from the first data file values.
          const years = Object.keys(areaData[0][key].map)
            .map(year => year.replace('y_', ''));
          years.forEach((year) => {
            // Aggregate the data values for this metric for this year from all the areas included in the report.
            if (metric.type === 'sum') {
              metricValues[year] = areaData.reduce(
                (prevVal, file) => (file[key].map[`y_${year}`] !== null
                  ? prevVal + file[key].map[`y_${year}`]
                  : prevVal), 0,
              );
            } else if (metric.type === 'mean') {
              metricValues[year] = areaData.reduce(
                (prevVal, file) => (file[key].map[`y_${year}`] !== null
                  ? prevVal + file[key].map[`y_${year}`]
                  : prevVal), 0,
              ) / areaData.filter(
                file => file[key].map[`y_${year}`] !== null,
              ).length;
            } else if (metric.type === 'weighted') {
              metricValues[year] = areaData.reduce((prevVal, file) => (
                file[key] && file[key].w[`y_${year}`] !== null && file[key].map[`y_${year}`] !== null
                  ? prevVal + file[key].map[`y_${year}`] * file[key].w[`y_${year}`]
                  : prevVal), 0)
                / areaData.reduce((prevVal, file) => (
                  file[key] && file[key].w[`y_${year}`] !== null
                    ? prevVal + file[key].w[`y_${year}`]
                    : prevVal), 0);
            }
          });
          commit('setMetricValues', { metric: key, values: metricValues });
        });
      });
    },

    // eslint-disable-next-line no-unused-vars
    async loadCountyAverages({ state, commit, rootState }) {
      if (Object.values(state.countyAverages).length) return;
      return fetchResponseJSON('/data/report/county_averages.json')
        .then((data) => {
          const countyAverages = {};
          Object.values(dataConfig) // Loop through all metrics in dataConfig and pull out those in the dataFile
            .filter(m => (m.geographies.indexOf(rootState.geography.id) > -1
              && m.metric in data)).forEach((m) => {
              if (!(m.category in countyAverages)) {
                Vue.set(countyAverages, m.category, {});
              }
              countyAverages[m.category][m.metric] = data[m.metric];
            });
          commit('setCountyAverages', countyAverages);
        });
    },
    async loadData({ dispatch }) {
      return Promise.all([dispatch('loadAreaData'), dispatch('loadCountyAverages')]);
    },
  },
};
