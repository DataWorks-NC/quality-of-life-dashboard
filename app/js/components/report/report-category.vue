<template>
    <div class="page page-category">
        <div class="row">
            <div class="col-xs-6 text-left">
    <h1>{{ category.name }}</h1></div>
        </div>
        <div class="row">
            <div class="col-xs-12">
        <ReportMetric v-for="m in category.metrics"
                      :key="m.id"
                      :metric="m"
                      :metricValues="metricValues && metricValues.hasOwnProperty(m.metric) ? metricValues[m.metric] : null"
                      :countyAverages="countyAverages && countyAverages.hasOwnProperty(m.metric) ? countyAverages[m.metric] : null"
        />
            </div>
            </div>
</div>
</template>

<script>
import ReportMetric from './report-metric';

  export default {
    name: 'report-category',
    components: {
      ReportMetric
    },
    props: {
      category: {
        type: Object,
        required: true,
      },
      metricValues: {
        type: Object,
        required: false,
      },
      countyAverages: {
        type: Object,
        requred: false,
      }
    }
  };
</script>

<style scoped>

</style>