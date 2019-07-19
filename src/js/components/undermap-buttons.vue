<template>
  <div class="flex-item mdl-typography--text-right undermap-controls">
    <p style="margin-top: 0;">
      <button
        :class="{'undermap-buttons__active' : selected.length}"
        :disabled="!selected.length"
        class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect selected-clear"
        @click="clearSelected"
      >
        <span class="mdl-chip__text">{{ $t('undermapButtons.clear') }}</span>
      </button>
      <button
        :class="{'undermap-buttons__active' : selected.length}"
        :disabled="!selected.length"
        class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
        data-fullreport
        @click="loadReport"
      >
        <span class="mdl-chip__text">{{ $t('undermapButtons.report') }}</span>
      </button>
      <button
        class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect undermap-buttons__active"
        data-printmap
        @click="loadEmbed"
      >
        <span class="mdl-chip__text">{{ $t('undermapButtons.printEmbed') }}</span>
      </button>
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import config from '../modules/config';

export default {
  name: 'UndermapButtons',
  data() {
    return { siteConfig: config.siteConfig };
  },
  computed: mapState(['selected']),
  methods: {
    loadReport() {
      this.$router.push({ name: 'report', params: this.$route.params, query: { ...this.$route.query, legendTitle: undefined } });
    },
    clearSelected() {
      this.$router.push({
        query: {
          ...this.$route.query, selected: [], reportTitle: undefined, legendTitle: undefined,
        },
      });
    },
    loadEmbed() {
      this.$router.push({ query: { ...this.$route.query, mode: 'print' } });
    },
  },
};
</script>

<style scoped>
span {
    opacity: 0.25;
}
.mdl-button {
  margin-left: 0.5em;
}
.undermap-buttons__active {
    background: #68089e;
}
.undermap-buttons__active span {
    opacity: 1;
    color: white;
    line-height: 13px;
}
</style>
