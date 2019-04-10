<template>
  <div class="map-container" style="position: relative">
    <dashboard-map :mapbox-access-token="privateConfig.mapboxAccessToken" :map-config="mapConfig"/>
    <dashboard-legend/>
    <div class="map-popout-button"><a :href="`${siteConfig.qoldashboardURL}#${urlHash}`" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" alt="View this map in the Durham Neighborhood Compass"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg></a></div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import config from './modules/config';

import DashboardLegend from './components/dashboard-legend.vue';
import DashboardMap from './components/dashboard-map.vue';

export default {
  name: 'Embed',
  components: {
    DashboardLegend,
    DashboardMap,
  },
  data() {
    return {
      siteConfig: config.siteConfig,
      privateConfig: config.privateConfig,
      mapConfig: config.mapConfig,
    };
  },
  computed: mapState({
    metric: 'metric',
    urlHash(state) {
      if (!state.metricId || !state.geography.id) return '';
      return `${state.printMode ? 'print/' : ''}${state.metricId}/${state.geography.id}/${state.selected.map(
        g => encodeURIComponent(g),
      ).join(',')}`;
    },
  }),
  beforeCreate() {
    // Check if there is an existing hash and use it, otherwise redirect to a random metric.
    if (location.hash) {
      // Helper function to get the current page hash.
      function getHash(pos = 0) {
        const hash = decodeURI(location.hash).split('/');
        if (hash[pos] && hash[pos].length > 0) {
          hash[pos] = hash[pos].toString().replace('#', '');
          return decodeURIComponent(hash[pos]);
        }
        return false;
      }
      const hashOffset = 0;

      // Hash has the form #[print]/metricId/geographyId/selectedid1,selectedid2
      if (getHash(hashOffset + 1)) {
        this.$store.commit('setGeographyId', getHash(hashOffset + 1));
      }
      if (getHash(hashOffset + 2)) {
        this.$store.commit('setSelected', getHash(hashOffset + 2).split(','));
      }
      this.$store.dispatch('changeMetric', getHash(hashOffset));
    } else {
      this.$store.dispatch('randomMetric');
    }
  },
};
</script>

<style>
.map-popout-button {
  position: absolute;
  bottom: 5px;
  left: 5px;
  color: #3a464a;
}
</style>
