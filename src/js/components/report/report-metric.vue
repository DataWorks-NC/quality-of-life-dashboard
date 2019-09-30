<template>
  <div>
    <h3>{{ metric.name }}</h3>
    <v-simple-table v-if="metricValues" class="metric-table">
      <tbody>
        <tr>
          <th class="metric-table__year">
            {{ $t('strings.year') | capitalize }}
          </th>
          <th class="metric-table__feature-value">
            <span v-if="metric.label">{{ $t(`metricLabels.${metric.label}`) | capitalize }}</span><span v-else>{{ $t('strings.FeatureValue') }}</span>
          </th>
          <th v-if="countyAverages" class="metric-table__county-average">
            <span v-if="metric.label">{{ $t(`metricLabels.${metric.label}`) | capitalize }} ({{ $t('strings.CountyAverage') }})</span>
            <span v-else>{{ $t('strings.CountyAverage') }}</span>
          </th>
        </tr>
        <tr v-for="year in years" :key="year">
          <td class="metric-table__year">
            {{ year }}
          </td>
          <td class="metric-table__feature-value">
            {{ prettify(metricValues[year]) }}
          </td>
          <td v-if="countyAverages" class="metric-table__county-average">
            {{ prettify(countyAverages[year]) }}
          </td>
        </tr>
      </tbody>
    </v-simple-table>
    <v-spacer />
    <div v-if="years.length > 1" class="metric-trendchart">
      <TrendChart v-if="metricValues || countyAverages"
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
import { prettyNumber } from '../../modules/number_format';

import MoreInfo from './report-more-info.vue';

const TrendChart = () => import(/* webpackChunkName: "trend-chart" */'../trend-chart.vue');

export default {
  name: 'ReportMetric',
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
      return Object.keys(this.metricValues);
    },
    notNull() {
      return (Object.values(this.metricValues).filter(v => (v !== null)).length > 0);
    },
  },
  methods: {
    prettify(value) {
      return prettyNumber(value, this.metric.decimals, this.metric.prefix, this.metric.suffix);
    },
  },
};
</script>
<style>
.metric-more-info__body h2:first-of-type {
    display: none;
}

.metric-more-info__body p:first-of-type {
    display: none;
}

.metric-more-info__body h3:first-of-type {
    display: none;
}
</style>
<style scoped>
td.metric-table__feature-value {
    background-color: #fcf8e3;
}
td.metric-table__selection-average {
    background-color: #dff0d8;
}
td.metric-table__county-average {
    background-color: #f5f5f5;
}
</style>