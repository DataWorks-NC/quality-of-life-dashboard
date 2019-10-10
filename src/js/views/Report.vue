<template>
  <div>
    <report-nav />
    <v-content>
      <v-container>
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

export default {
  name: 'Report',
  components: {
    DashboardFooter,
    ReportNav,
    ReportSummary,
    ReportBody,
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

<style scoped>
.header {
  max-width: 768px;
  margin: 20px auto;
}

.metric-selector__title, .language-switcher {
  color: #337ab7;
  cursor: pointer;
  font-weight: bold;
}


.language-switcher {
  float: right;
  display: block;
}
</style>
