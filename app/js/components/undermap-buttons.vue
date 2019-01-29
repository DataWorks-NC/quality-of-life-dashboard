<template>
  <div class="flex-item mdl-typography--text-right undermap-controls">
    <p style="margin-top: 0;">
      <button
        :class="{'undermap-buttons__active' : selected.length}"
        class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect selected-clear"
        @click="clearSelected"
      >
        <span class="mdl-chip__text">Clear Selected</span>
      </button>
      <button
        v-if="siteConfig.qolReportURL" :class="{'undermap-buttons__active' : selected.length}"
        class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
        data-fullreport
        @click="loadReport"
      >
        <span class="mdl-chip__text">Report</span>
      </button>
      <button
        v-if="siteConfig.qolEmbedURL"
        class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
        data-printmap
        @click="loadEmbed"
      >
        <span class="mdl-chip__text">Print Map</span>
      </button>
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'UndermapButtons',
  computed: mapState(['siteConfig', 'selected']),
  methods: {
    loadReport() {
      window.open(this.$store.getters.reportUrl);
    },
    clearSelected() {
      this.$store.dispatch('clearSelected');
    },
    loadEmbed() {
      window.open(this.$store.getters.embedUrl);
    },
  },
};
</script>

<style scoped>
span {
    opacity: 0.25;
}
.undermap-buttons__active {
    background: #00688B;
}
.undermap-buttons__active span {
    opacity: 1;
    color: white;
}
</style>
