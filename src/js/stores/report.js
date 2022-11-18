import { defineStore } from 'pinia';
import { xor } from 'lodash-es';
import { fetchResponseJSON } from '../modules/fetch';
import config from '../modules/config';
import i18n from '../../plugins/i18n';
import { mainStore } from '@/js/stores/index.js';

const { siteConfig, dataConfig } = config;

const getJSONFilename = (geographyId, areaId) => `/data/report/${geographyId}/${areaId}.json`;

export const reportStore = defineStore('report', {
  state: () => ( {
    categoryNamesBase: new Array(...new Set(Object.values(dataConfig).map(m => (m.category)))),
    metrics: {}, // Config values for each metric which is in the current geography, plus new visibility flag. Keyed by metric ID.
    metricValues: {}, // Values for each metric in the report.
    countyAverages: {},
    activeCategory: '',
    areaDataLoadedFor: {}, // Store the selection for which area data was last loaded.
  }),
  getters: {
    categoryNames: state => state.categoryNamesBase.filter(c => (c in state.metricValues || c in state.countyAverages)),
    areaNames: (state, getters, rootState) => getters.selected.map(id => (getters.language === 'es' ? rootState.geography.label_es(id) : rootState.geography.label(id))),
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

    reportTitle: (state, getters, rootState) => {
      if (rootState.route && 'selectGroupName' in rootState.route.query && getters.selectGroupIds === getters.selected) {
        const selectGroupType = i18n.t(`selectGroup.${rootState.route.query.selectGroupType}`);
        return `${rootState.route.query.selectGroupName} (${selectGroupType})`;
      }
      return getters.areaNames.join(', ');
    },

    // Pull the most recent year for each metric listed in siteConfig.summaryMetrics for which we have valid metric values.
    summaryMetrics: (state) => {
      const valuesSource = Object.keys(state.metricValues).length ? state.metricValues : state.countyAverages;
      return siteConfig.summaryMetrics.map((id) => {
        if (!(id in dataConfig)) return false;
        const metric = dataConfig[id];
        if (metric.category in valuesSource && metric.metric in valuesSource[metric.category]) {
          metric.value = Object.values(valuesSource[metric.category][metric.metric]).slice(-1)[0];
        }
        return metric;
      }).filter(i => i);
    },
  },
  actions: {
    // Populate metrics array on report data, which tracks visibility as well.
    populateMetrics({ geography }) {
      const geographyMetrics = Object.keys(dataConfig).filter(m => dataConfig[m].geographies.indexOf(geography.id) > -1);
      geographyMetrics.forEach(m => this.metrics[m] = { visible: true, ...dataConfig[m] });
    },

    // Hide all metrics, so that we can individually toggle on specific metrics/categories.
    hideAllMetrics() {
      Object.values(this.metrics).forEach((m) => { m.visible = false; });
    },

    // Show all metrics.
    showAllMetrics() {
      Object.values(this.metrics).forEach((m) => { m.visible = true; });
    },

    // Turn on or off all metrics within a particular category.
    toggleCategory({ categoryName, visibility }) {
      Object.keys(this.metrics).forEach((m) => {
        if (this.metrics[m].category === categoryName) {
          this.metrics[m].visible = visibility;
        }
      });
    },

    toggleMetric({ metricId, visibility }) {
      if (metricId in this.metrics) {
        this.metrics[metricId].visible = visibility;
      }
    },

    // Metric is the ID of a metric, without the 'm' prefix. Values is an object mapping years to data values.
    setMetricValues({ metric, values }) {
      const metricConfig = dataConfig[`m${metric}`];
      if (!(metricConfig.category in this.metricValues)) {
        this.metricValues[metricConfig.category] = {};
      }
      this.metricValues[metricConfig.category][metric] = values;
    },


    // Load data first (from individual JSONs, one for each area included in the report, then set area IDs.
    async loadAreaData() {
      const rootState = mainStore();

      if (rootState.selected.length === 0) {
        return;
      }

      const selected = rootState.selected;

      if (xor(selected, this.areaDataLoadedFor).length === 0) {
        // If areaDataLoaded is exactly equal to selected, return.
        return;
      }

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
          this.setMetricValues({ metric: key, values: metricValues });
        });

        this.areaDataLoadedFor = selected;
      });
    },

    // eslint-disable-next-line no-unused-vars
    async loadCountyAverages() {
      const rootState = mainStore();

      if (Object.values(this.countyAverages).length) return;
      return fetchResponseJSON('/data/report/county_averages.json')
      .then((data) => {
        const countyAverages = {};
        Object.values(dataConfig) // Loop through all metrics in dataConfig and pull out those in the dataFile
          .filter(m => (m.geographies.indexOf(rootState.geography.id) > -1
            && m.metric in data)).forEach((m) => {
          if (!(m.category in countyAverages)) {
            countyAverages[m.category] = {};
          }
          countyAverages[m.category][m.metric] = data[m.metric];
        });
        this.countyAverages = countyAverages;
      });
    },
    async loadData() {
      return Promise.all([this.loadAreaData(), this.loadCountyAverages()]);
    },
  }
})
