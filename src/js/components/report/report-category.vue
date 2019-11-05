<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2>{{ category.name }}</h2>
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
import ReportMetric from "./report-metric";

export default {
  name: "ReportCategory",
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

<style lang="scss" scoped>
h2 {
  font-size: 1.5em;
  font-weight: 700;
  position: relative;
  margin-top: 0.75em;
  margin-bottom: 0.75em;
  text-transform: uppercase;

  &::after {
    content: "";
    width: 150px;
    height: 3px;
    background-color: var(--v-primary-base);
    position: absolute;
    bottom: -10px;
    left: 0;
  }
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
