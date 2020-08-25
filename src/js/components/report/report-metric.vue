<template>
  <div v-if="metricValues || countyAverages" :id="`metric-${metric.metric}`">
    <h3>{{ metric.name }}</h3>
    <v-simple-table class="metric-table">
      <tbody>
        <tr>
          <th class="metric-table__year">
            {{ $t('strings.year') | capitalize }}
          </th>
          <th v-if="metricValues" class="metric-table__feature-value">
            <span v-if="metric.label">{{ $t(`metricLabels.${metric.label}`) | capitalize }}</span>
            <span v-else>{{ $t('strings.FeatureValue') }}</span>
          </th>
          <th v-if="countyAverages" class="metric-table__county-average">
            <span
              v-if="metric.label"
            >{{ $t(`metricLabels.${metric.label}`) | capitalize }} ({{ $t('strings.CountyAverage') }})</span>
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
    </v-simple-table>
    <v-spacer />
    <div v-if="years.length > 1" class="metric-trendchart">
      <TrendChart
        :metric-config="metric"
        :years="years"
        :values="metricValues"
        :county-values="countyAverages"
        :selected="[]"
      />
    </div>
    <v-spacer />
    <MoreInfo :href="`/data/meta/${$i18n.locale}/m${metric.metric}.html`" />
  </div>
</template>

<script>
import { prettyNumber } from "../../modules/number_format";

import MoreInfo from "./report-more-info.vue";

const TrendChart = () => import(/* webpackChunkName: "trend-chart" */ "../trend-chart.vue");

export default {
  name: "ReportMetric",
  components: {
    MoreInfo,
    TrendChart,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: () => true,
    },
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
  computed: {
    years() {
      const metricYears = this.metricValues ? Object.keys(this.metricValues) : [];
      const countyYears = this.countyAverages ? Object.keys(this.countyAverages) : [];
      return Array.from(new Set(metricYears.concat(countyYears))).sort();
    },
  },
  methods: {
    prettify(value) {
      return prettyNumber(
        value,
        this.metric.decimals,
        this.metric.prefix,
        this.metric.suffix,
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
