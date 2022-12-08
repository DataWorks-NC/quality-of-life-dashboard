<template>
  <div>
    <v-app-bar theme="dark" class="d-print-none">
      <v-toolbar-title>
        <router-link :to="{ name: 'homepage' }">
          <img src="../../assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')">
        </router-link>
      </v-toolbar-title>
      <div class="flex-grow-1" />
      <v-btn @click="print()">
        <v-icon :icon="mdiPrinter" /> {{ $filters.allcaps($t('printMapHeader.print')) }}
      </v-btn>
      <v-btn :to="{ query: { ...$route.query, mode: undefined, legendTitle: undefined } }">
        <v-icon :icon="mdiArrowLeft" /> {{ $filters.allcaps($t('printMapHeader.back')) }}
      </v-btn>
    </v-app-bar>
    <v-main>
      <print-map-header class="d-print-none" />
      <img :alt="$t('strings.DataWorksNCLogo')" src="@/assets/img/report-logo.png?url" class="header__logo">
      <div class="spacer" />
      <v-card class="map d-print-inline">
        <div v-if="mapboxglLoaded" style="min-height: 600px;">
          <ClientOnly>
            <map-container />
          </ClientOnly>
        </div>
        <i18n-t keypath="printMode.footerText" tag="p" class="print__footer">
          <template #compassLink>
            <a href="https://compass.durhamnc.gov">{{ $t('strings.theCompass') }}</a>
          </template>
        </i18n-t>
      </v-card>
    </v-main>
  </div>
</template>

<script>
import { mdiPrinter, mdiArrowLeft } from "@mdi/js";
import { defineAsyncComponent } from 'vue';
import PrintMapHeader from './print-map-header.vue';

const MapContainer = defineAsyncComponent(() => import('./map/MapContainer.vue'));

export default {
  name: 'PrintMode',
  components: {
    MapContainer,
    PrintMapHeader,
  },
  inject: ['mapboxglLoaded',],
  data: () => ({ mdiPrinter, mdiArrowLeft }),
  methods: {
    print() {
      window.print();
    },
  },
};
</script>

<style>
body.print {
  min-width: 8.5in;
}

.print .mdl-layout__container {
  min-width: 8.5in;
}

.print .mdl-grid {
  max-width: 8.5in;
  padding: 0.25in;
}

.print .map-container {
  height: 8in;
}

.print #map {
  height: 8in;
  min-width: 7.33in;
}

.print .print__footer {
  font-size: 8pt;
  padding: 0.125in;
  font-style: italic;
}

.header__logo {
  display: none;
}

@media print {
  .print .v-card {
    padding: 0;
  }
  .print .map-container {
    height: 8in;
  }

  .print #map {
    height: 8in;
    border: 3pt double;
  }

  .print #legend {
    margin: 3pt;
  }

  .header__logo {
    display: block;
    height: 0.25in;
    margin: auto;
  }

  .mapboxgl-popup {
    display: none;
  }
}

@page {
  size: letter portrait;
}
</style>
