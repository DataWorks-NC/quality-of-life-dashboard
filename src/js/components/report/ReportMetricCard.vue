<template>
  <div v-if="metricValues || countyAverages" :id="`metric-${metric.metric}`">
    <h3>{{ metric.name }}</h3>
    <v-table class="metric-table">
      <tbody>
        <tr>
          <th class="metric-table__year">
            {{ $filters.capitalize($t('strings.year')) }}
          </th>
          <th v-if="metricValues" class="metric-table__feature-value">
            <span v-if="metric.label">{{ $filters.capitalize($t(`metricLabels.${metric.label}`)) }}</span>
            <span v-else>{{ $t('strings.FeatureValue') }}</span>
          </th>
          <th v-if="countyAverages" class="metric-table__county-average">
            <span
              v-if="metric.label"
            >{{ $filters.capitalize($t(`metricLabels.${metric.label}`)) }} ({{ $t('strings.CountyAverage') }})</span>
            <span v-else>{{ $t('strings.CountyAverage') }}</span>
          </th>
        </tr>
        <tr v-for="year in years" :key="year">
          <td class="metric-table__year">
            {{ year }}
          </td>
          <td v-if="metricValues" class="metric-table__feature-value">
            {{ prettify(metricValues[year]) }}
          </td>
          <td
            v-if="countyAverages"
            class="metric-table__county-average"
          >
            {{ prettify(countyAverages[year]) }}
          </td>
        </tr>
      </tbody>
    </v-table>
    <div class="spacer" />
    <div v-if="years.length > 1" class="metric-trendchart">
      <ClientOnly>
        <TrendChart
          :metric-config="metric"
          :years="years"
          :values="metricValues"
          :county-values="countyAverages"
          :selected="[]"
        />
      </ClientOnly>
    </div>
    <div class="spacer" />
    <ClientOnly>
      <MoreInfo :href="`/data/meta/${$i18n.locale}/m${metric.metric}.html`" />
    </ClientOnly>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { prettyNumber } from "../../helpers/numberFormat.js";
import {reportStore} from '@/js/stores/report-store.js';
import MoreInfo from "./ReportMoreInfo.vue";

const TrendChart = defineAsyncComponent(() => import("../TrendChart.vue"));

export default {
  name: "ReportMetricCard",
  components: {
    MoreInfo,
    TrendChart,
  },
  props: {
    metric: {
      type: Object,
      required: true,
    },
    metricValues: {
      type: Object,
      default: () => {},
    },
    countyAverages: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      reportStore,
    };
  },
  computed: {
    years() {
      const metricYears = this.metricValues ? Object.keys(this.metricValues) : [];
      const countyYears = this.countyAverages ? Object.keys(this.countyAverages) : [];
      return Array.from(new Set(metricYears.concat(countyYears))).sort();
    },
  },
  mounted() {
    if (this.$route.hash === `#metric-${this.metric.metric}`) {
      this.$el.scrollIntoView();
      window.scrollBy(0, -50);

      this.reportStore.activeCategory = this.$t(`strings.metricCategories['${this.metric.category}']`);
    }
  },
  methods: {
    prettify(value) {
      return prettyNumber(
        value,
        this.metric,
      );
    },
  },
};
</script>
<style lang="scss" scoped>
h3 {
  font-size: 1.25em;
}
td.metric-table__feature-value {
  background-color: #b2f3ed;
}
.theme--light.v-data-table tbody tr:nth-of-type(odd) {
  background-color: #eff3f4;
  &:hover {
    background-color: #eff3f4;
  }
}
.theme--light.v-data-table tbody tr:hover {
  background-color: white;
}
</style>
