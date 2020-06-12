<template>
  <div>
    <v-app-bar dark class="d-print-none">
      <v-toolbar-title>
        <router-link :to="{ name: 'homepage' }">
          <img src="../../assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')">
        </router-link>
      </v-toolbar-title>
      <div class="flex-grow-1" />
      <v-btn @click="print()">
        <v-icon>{{ mdiPrinter }}</v-icon> {{ $t('printMapHeader.print') | allcaps }}
      </v-btn>
      <v-btn :to="{ query: { ...this.$route.query, mode: undefined, legendTitle: undefined } }">
        <v-icon>{{ mdiArrowLeft }}</v-icon> {{ $t('printMapHeader.back') | allcaps }}
      </v-btn>
    </v-app-bar>
    <v-content>
      <print-map-header :config="config" class="d-print-none" />
      <img :alt="$t('strings.DataWorksNCLogo')" :src="require('@/assets/img/report-logo.png')" class="header__logo">
      <v-spacer />
      <v-card class="map d-print-inline">
        <div class="map-container" style="position: relative">
          <dashboard-map :mapbox-access-token="config.privateConfig.mapboxAccessToken" :map-config="Object.assign({ trackResize: false }, config.mapConfig)" />
          <dashboard-legend />
        </div>
        <i18n path="printMode.footerText" tag="p" class="print__footer">
          <template v-slot:compassLink>
            <a href="https://compass.durhamnc.gov">{{ $t('strings.theCompass') }}</a>
          </template>
        </i18n>
      </v-card>
    </v-content>
  </div>
</template>

<script>
import { mdiPrinter, mdiArrowLeft } from "@mdi/js";

import DashboardLegend from './dashboard-legend.vue';
import PrintMapHeader from './print-map-header.vue';

const DashboardMap = () => import(/* webpackChunkName: "dashboard-map" */ './dashboard-map.vue');

export default {
  name: 'PrintMode',
  components: {
    DashboardLegend,
    DashboardMap,
    PrintMapHeader,
  },
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
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
