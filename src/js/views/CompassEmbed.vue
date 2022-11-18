<template>
  <v-main>
    <map-container :map-config="mapConfig" />
    <div class="map-popout-button">
      <router-link :to="{ name: 'compass', params: $route.params, query: { ...$route.query, legendTitle: undefined } }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" alt="View this map in the Durham Neighborhood Compass"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" /></svg>
      </router-link>
    </div>
  </v-main>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { mapState } from 'pinia';
import { mainStore } from '@/js/stores/index.js';

import config from '../modules/config';

const MapContainer = defineAsyncComponent(() => import('../components/map/MapContainer.vue'));

export default {
  name: 'CompassEmbed',
  components: {
    MapContainer,
  },
  data() {
    return {
      siteConfig: config.siteConfig,
      mapConfig: config.mapConfig,
      config,
    };
  },
  computed: {
    ...mapState(mainStore, ['metric']),
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
