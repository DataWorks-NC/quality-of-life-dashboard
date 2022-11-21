import { defineStore } from 'pinia';
import config from '../modules/config';

const { siteConfig, dataConfig } = config;


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
    categoryNames: state => state.categoryNamesBase ? state.categoryNamesBase.filter(c => (c in state.metricValues || c in state.countyAverages)) : [],

    // Returns true iff all metrics are visible.
    everythingVisible: state => Object.values(state.metrics).every(m => m.visible),
    visibleCategories() {
      return this.categoryNames.filter(c => (c in this.metricValues || c in this.countyAverages) && Object.values(this.metrics).some(m => m.category === c && m.visible));
    },
    // Utility function for setting the query string, returns any categories which are 100% shown.
    totallyVisibleCategories()  {
      return this.visibleCategories.filter(c => Object.values(this.metrics).filter(m => m.category === c).every(m => m.visible))
    },
    // Utility function for setting the query string, returns only the IDs of metrics which are visible but for which the whole category is not visible.
    visibleMetricsInMixedCategories() {
      return Object.values(this.metrics).filter(m => this.totallyVisibleCategories.indexOf(m.category) === -1 && m.visible).map(m => m.metric);
    },

    hiddenCategories() {
      return this.categoryNames.filter(c => Object.values(this.metrics).some(m => m.category === c) && !Object.values(this.metrics).filter(m => m.category === c).some(m => m.visible))
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
  }
})
