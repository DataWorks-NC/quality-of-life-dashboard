<template>
  <div class="report">
    <report-nav />
    <v-content>
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
    </v-content>
    <dashboard-footer />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import config from '../modules/config';

import DashboardFooter from '../components/dashboard-footer.vue';
import ReportSummary from '../components/report/report-summary';
import ReportBody from '../components/report/report-body';
import ReportNav from '../components/report/report-nav';
import ReportJumpNav from '../components/report/report-jump-nav';

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
  computed: { ...mapState(['geography', 'selected']), ...mapGetters(['reportTitle', 'summaryMetrics']) },
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
