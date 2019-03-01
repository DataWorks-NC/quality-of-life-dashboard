<template>
  <div v-if="notNull && visible" class="row">
    <div class="col-md-12">
      <h3>{{ metric.title }}</h3>
      <table v-if="metricValues" class="table table-striped metric-table">
        <tbody>
          <tr>
            <th class="metric-table__year">Year</th>
            <th class="metric-table__feature-value">Feature Value</th>
            <th v-if="countyAverages" class="metric-table__county-average">County Average</th>
          </tr>
          <tr v-for="year in years">
            <td class="metric-table__year">{{ year }}</td>
            <td class="metric-table__feature-value">{{ prettify(metricValues[year]) }}</td>
            <td v-if="countyAverages" class="metric-table__county-average">{{ prettify(countyAverages[year]) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="years.length > 1" class="metric-trendchart">
        <TrendChart v-if="metricValues && countyAverages"
                    :metric-config="metric"
                    :years="years"
                    :values="metricValues"
                    :average-values="countyAverages"
                    :selected="[]"
        />
      </div>
    <MoreInfo :href="`data/meta/m${metric.metric}.html`"></MoreInfo>
    </div>
  </div>
</template>

<script>
import TrendChart from './report-chart.vue';
import MoreInfo from './report-more-info.vue';
import { prettyNumber } from '../../modules/number_format';

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
      required: true,
      default: () => {},
    },
    countyAverages: {
      type: Object,
      required: true,
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
