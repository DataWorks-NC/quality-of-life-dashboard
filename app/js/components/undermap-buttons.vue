<template>
    <div class="flex-item mdl-typography--text-right undermap-controls">
        <p style="margin-top: 0;">
            <button
                    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect selected-clear"
                    v-bind:class="{'mdl-button--accent' : sharedState.selected.length}"
                    v-on:click="clearSelected"
            >
                Clear Selected
            </button>
            <button
                    v-if="privateState.qolReportURL" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
                    v-bind:class="{'mdl-button--accent' : sharedState.selected.length}"
                    v-on:click="loadReport"
                    data-fullreport
            >
                Report
            </button>
            <button
                    v-if="privateState.qolEmbedURL"
                    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
                    v-on:click="loadEmbed"
                    data-printmap
            >
                Print Map
            </button>
        </p>
    </div>
</template>

<script>
import { replaceState } from '../modules/tracking.js';

export default {
methods: {
  loadReport: function(event) {
    const newHash = encodeURI(`${this.sharedState.geography.id}/${this.sharedState.selected.map(g => encodeURIComponent(g)).join(',')}`);
    window.open(`${this.privateState.qolReportURL}#${newHash}`);
  },
  clearSelected: function(event) {
    this.sharedState.selected = [];
    replaceState(this.sharedState.metricId, [], this.sharedState.geography.id);
  },
  loadEmbed: function(event) {
    window.open(
        `${this.privateState.qolembedURL}?m=${this.sharedState.metricId}&y=${
            this.sharedState.year
            }&s=${this.sharedState.selected.join(',')}`
    );
  }
},
name: 'undermap-buttons',
};
</script>

<style scoped>

</style>
