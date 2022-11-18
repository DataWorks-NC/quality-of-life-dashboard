<template>
  <div class="report">
    <report-nav />
    <v-main>
      <v-container>
        <report-jump-nav />
        <report-summary
          :report-title="reportTitle"
          :selected="selected"
          :geography-id="geography.id"
          :summary-metrics="summaryMetrics"
          :map-config="mapConfig"
        />
        <div class="spacer" />
        <report-body />
      </v-container>
    </v-main>
    <dashboard-footer />
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { mainStore } from '@/js/stores/index.js';
import { reportStore } from '@/js/stores/report.js';
import config from '../modules/config';

import DashboardFooter from '../components/dashboard-footer.vue';
import ReportSummary from '../components/report/report-summary.vue';
import ReportBody from '../components/report/report-body.vue';
import ReportNav from '../components/report/report-nav.vue';
import ReportJumpNav from '../components/report/report-jump-nav.vue';

export default {
  name: 'Report',
  components: {
    DashboardFooter,
    ReportNav,
    ReportSummary,
    ReportBody,
    ReportJumpNav,
  },
  data: () => ({
    mapConfig: config.mapConfig,
  }),
  computed: {
    ...mapState(mainStore, ['geography']),
    ...mapState(reportStore, ['reportTitle', 'summaryMetrics', 'selected']),
    reportTitle() { return this.reportTitle || this.$t('strings.DurhamCounty'); },
  },
};
</script>

<style lang="scss" scoped>
.report {
  .container {
    max-width: 1000px;
  }
}
</style>
