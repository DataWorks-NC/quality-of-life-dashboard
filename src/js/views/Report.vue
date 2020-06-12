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
        <v-spacer />
        <report-body />
      </v-container>
    </v-main>
    <dashboard-footer />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
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
    storeWatchers: [],
  }),
  computed: {
    ...mapState(['geography', 'selected']),
    ...mapGetters(['summaryMetrics']),
    reportTitle() { return this.$store.getters.reportTitle || this.$t('strings.DurhamCounty'); },
  },
  mounted() {
    this.$nextTick(() => {
      let event;
      if (typeof Event === 'function') {
        event = new Event("x-app-rendered");
      } else {
        event = document.createEvent('Event');
        event.initEvent('x-app-rendered', true, true);
      }
      document.dispatchEvent(event);
    });
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
