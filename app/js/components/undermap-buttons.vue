<template>
    <div class="flex-item mdl-typography--text-right undermap-controls">
        <p style="margin-top: 0;">
            <button
                    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect selected-clear"
                    v-bind:class="{'undermap-buttons__active' : sharedState.selected.length}"
                    v-on:click="clearSelected"
            >
                <span class="mdl-chip__text">Clear Selected</span>
            </button>
            <button
                    v-if="privateState.qolReportURL" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect"
                    v-bind:class="{'undermap-buttons__active' : sharedState.selected.length}"
                    v-on:click="loadReport"
                    data-fullreport
            >
                <span class="mdl-chip__text">Report</span>
            </button>
            <button
                    v-if="privateState.qolEmbedURL"
                    class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
                    v-on:click="loadEmbed"
                    data-printmap
            >
                <span class="mdl-chip__text">Print Map</span>
            </button>
        </p>
    </div>
</template>

<script>
import { replaceState } from '../modules/tracking.js';

export default {
methods: {
  loadReport: function(event) {
    const newHash = encodeURI(`${this.sharedState.geography.id}/${this.sharedState.selected.map(g => encodeURIComponent(g)).join(',')}${this.sharedState.selectGroupName ? `/${this.sharedState.selectGroupName}` : ''}`);
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
