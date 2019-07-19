<template>
  <div id="app">
    <div class="header d-print-none">
      <a class="metric-selector__title" @click.prevent="selectorCollapsed=!selectorCollapsed">{{ $t('reportSelector.customize') }}</a>
      <a class="language-switcher" @click="swapLanguage()">{{ $t('strings.ChangeLanguage') }}</a>
      <report-selector :collapsed="selectorCollapsed" @collapse-selector="selectorCollapsed=true" />
    </div>
    <report-summary
      :report-title="reportTitle"
      :selected="selected"
      :geography-id="geography.id"
      :summary-metrics="summaryMetrics"
      :map-config="mapConfig"
    />
    <report-body />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import config from '../modules/config';

import ReportSummary from '../components/report/report-summary';
import ReportBody from '../components/report/report-body';
import ReportSelector from '../components/report/report-selector';

export default {
  name: 'Report',
  components: {
    ReportSummary,
    ReportSelector,
    ReportBody,
  },
  data: () => ({
    mapConfig: config.mapConfig,
    selectorCollapsed: true,
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
  methods: {
    swapLanguage() {
      let newLanguage = 'es';
      if (this.$i18n.locale === 'es') {
        newLanguage = 'en';
      }
      this.$router.push({ params: { ...this.$route.params, locale: newLanguage }, query: this.$route.query });
    },
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
