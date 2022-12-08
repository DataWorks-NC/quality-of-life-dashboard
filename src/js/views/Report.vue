<template>
  <div class="report">
    <report-nav />
    <v-main id="report-container">
      <v-container>
        <report-jump-nav />
        <report-summary
          :summary-metrics="summaryMetrics"
        />
        <div class="spacer" />
        <report-body />
      </v-container>
    </v-main>
    <dashboard-footer />
  </div>
</template>

<script>
import { computed } from 'vue';
import parseRouteMixin from '@/js/components/mixins/parseRouteMixin.js';
import handleLinksMixin from '@/js/components/mixins/handleLinksMixin.js';

import { reportStore } from '@/js/stores/report-store.js';
import config from '../modules/config';
const categoryNamesBase = new Array(...new Set(Object.values(config.dataConfig).map(m => (m.category))));

import DashboardFooter from '../components/dashboard-footer.vue';
import ReportSummary from '../components/report/report-summary.vue';
import ReportBody from '../components/report/report-body.vue';
import ReportNav from '../components/report/report-nav.vue';
import ReportJumpNav from '../components/report/report-jump-nav.vue';
import {xor} from 'lodash-es';
import {fetchResponseJSON} from '@/js/modules/fetch.js';
import {useHead} from '@vueuse/head';

const getJSONFilename = (geographyId, areaId) => `/data/report/${geographyId}/${areaId}.json`;

export default {
  name: 'Report',
  components: {
    DashboardFooter,
    ReportNav,
    ReportSummary,
    ReportBody,
    ReportJumpNav,
  },
  mixins: [parseRouteMixin, handleLinksMixin],
  provide() {
    return {
      geography: computed(() => this.geography),
      selected: computed(() => this.selected),
      reportTitle: computed(() => this.reportTitle),
      selectGroupName: computed(() => this.selectGroupName),
      metricValues: computed(() => this.metricValues),
      countyAverages: computed(() => this.countyAverages),
      categoryNames: computed(() => this.categoryNames),
      intersectionObserver: computed(() => this.intersectionObserver),
    };
  },
  data: () => ({
    metricValues: {},
    countyAverages: {},
    areaDataLoadedFor: [],
    intersectionObserver: null,
    reportStore,
  }),
  computed: {
    // Pull the most recent year for each metric listed in siteConfig.summaryMetrics for which we have valid metric values.
    summaryMetrics() {
      const valuesSource = Object.keys(this.metricValues).length ? this.metricValues : this.countyAverages;
      return config.siteConfig.summaryMetrics.map((id) => {
        if (!(id in config.dataConfig)) return false;
        const metric = config.dataConfig[id];
        if (metric.category in valuesSource && metric.metric in valuesSource[metric.category]) {
          metric.value = Object.values(valuesSource[metric.category][metric.metric]).slice(-1)[0];
        }
        return metric;
      }).filter(i => i);
    },
    categoryNames() {
      return categoryNamesBase ? categoryNamesBase.filter(c => (c in this.metricValues || c in this.countyAverages)) : [];
    },
    areaNames() {
      return (this.geography && this.selected) ?
        this.selected.map(id => (this.$i18n.locale === 'es' ?
          this.geography.label_es(id) :
          this.geography.label(id))) :
        []
    },
    reportTitle() {
      if (this.selectGroupName) {
        return `${this.selectGroupName} (${this.selectGroupType})`;
      }
      if (this.areaNames.length) {
        return this.areaNames.join(', ');
      }

      return this.$t('strings.DurhamCounty');
    },
  },
  watch: {
    selected() { this.loadData(); }
  },
  created() {
    this.loadData();

    useHead({
      title: this.reportTitle,
      meta: [
        {
          name: 'og:title',
          content: this.reportTitle,
        },
        {
        name: 'description',
          content: this.$t('strings.metaDescriptionReport', { title: this.reportTitle}),
        },
        {
          name: 'og:description',
          content: this.$t('strings.metaDescriptionReport', { title: this.reportTitle}),
        },
        {
          name: 'og:type',
          content: 'article',
        }
    ]
    });
  },
  async mounted() {
    this.intersectionObserver = new IntersectionObserver(
      this.onElementObserved,
      {
        root: null,
      }
    );
  },
  beforeUnmount() {
    this.intersectionObserver.disconnect();
  },
  methods: {
    onElementObserved(entries) {
      if (this.reportStore.isScrolling) {
        return;
      }
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          this.reportStore.activeCategory = target.getAttribute('data-category');
        }
      });
    },

    // Load data first from individual JSONs, one for each area included in the report, then set area IDs.
    async loadAreaData() {
      if (this.selected.length === 0) {
        return;
      }

      if (xor(this.selected, this.areaDataLoadedFor).length === 0) {
        // If areaDataLoaded is exactly equal to selected, return.
        return;
      }

      // Load array of JSON file data for each metric.
      // eslint-disable-next-line consistent-return
      return Promise.all(this.selected.map(id => fetchResponseJSON(getJSONFilename(this.geography.id, id)))).then((areaData) => {
        // Only examine metrics for which we have proper config. First key in the datafile format is geography_name, so skip that one too.
        const metricsToLoad = Object.keys(areaData[0]).filter(key => key !== 'geography_name' && (`m${key}` in config.dataConfig));

        metricsToLoad.forEach((key) => {
          const metric = config.dataConfig[`m${key}`];
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

        this.areaDataLoadedFor = this.selected;
      });
    },

    // Metric is the ID of a metric, without the 'm' prefix. Values is an object mapping years to data values.
    setMetricValues({ metric, values }) {
      const metricConfig = config.dataConfig[`m${metric}`];
      if (!(metricConfig.category in this.metricValues)) {
        this.metricValues[metricConfig.category] = {};
      }
      this.metricValues[metricConfig.category][metric] = values;
    },

    // eslint-disable-next-line no-unused-vars
    async loadCountyAverages() {
      if (Object.values(this.countyAverages).length) return;
      return fetchResponseJSON('/data/report/county_averages.json')
      .then((data) => {
        const countyAverages = {};
        Object.values(config.dataConfig) // Loop through all metrics in dataConfig and pull out those in the dataFile
          .filter(m => (m.geographies.indexOf(this.geography.id) > -1
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
};
</script>

<style lang="scss" scoped>
.report {
  .container {
    max-width: 1000px;
  }
}
</style>
