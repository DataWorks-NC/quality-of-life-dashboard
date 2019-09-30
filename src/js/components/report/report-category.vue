<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>{{ category.name }}</h1>
      </v-col>
    </v-row>
    <div v-for="m in category.metrics" :key="m.metric">
      <v-row>
        <v-col cols="12">
          <ReportMetric
            :key="m.metric"
            :metric="m"
            :metric-values="metricValues && m.metric in metricValues ? metricValues[m.metric] : null"
            :county-averages="countyAverages && m.metric in countyAverages ? countyAverages[m.metric] : null"
            :visible="m.visible"
          />
        </v-col>
      </v-row>
      <v-spacer />
    </div>
  </v-container>
</template>

<script>
import ReportMetric from './report-metric';

export default {
  name: 'ReportCategory',
  components: {
    ReportMetric,
  },
  props: {
    category: {
      type: Object,
      required: true,
    },
    metricValues: {
      type: Object,
      required: false,
      default: () => {},
    },
    countyAverages: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
};
</script>

<style scoped>
.page-category h1 {
    margin: 0;
    text-shadow: 1px 1px 1px #ccc;
}
.page-category .table {
    margin-top: 30px;
}
.page-category .table td {
    white-space: nowrap;
    font-size: 0.9em;
}
.page-category .table td:first-of-type {
    white-space: normal;
}
.page-category .report-column-selected {
    background: #dce6f0;
}
.page-category .report-column-county {
    background: #ecf0df;
}
</style>
