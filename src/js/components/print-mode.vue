<template>
  <div class="mdl-grid">
    <print-map-header :config="config"/>
    <img :alt="$t('strings.DataWorksNCLogo')" src="../../assets/img/report-logo.png" class="header__logo">
    <div class="map mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
      <main class="map-container" style="position: relative">
        <dashboard-map :mapbox-access-token="config.privateConfig.mapboxAccessToken" :map-config="Object.assign({ trackResize: false }, config.mapConfig)"/>
        <dashboard-legend/>
      </main>
      <i18n path="printMode.footerText" tag="footer">
        <a place="compassLink" href="https://compass.durhamnc.gov">{{ $t('strings.theCompass') }}</a>
      </i18n>
    </div>
  </div>
</template>

<script>
import DashboardLegend from './dashboard-legend.vue';
import DashboardMap from './dashboard-map.vue';
import PrintMapHeader from './print-map-header.vue';

export default {
  name: 'PrintMode',
  components: {
    DashboardLegend,
    DashboardMap,
    PrintMapHeader,
  },
  props: [
    'config',
  ],
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

.print footer {
  font-size: 8pt;
  padding: 0.125in;
  font-style: italic;
}

.header__logo {
  display: none;
}

.mdl-cell {
  padding: 8px;
}

.mdl-cell.map {
  padding: 0;
}

@media print {
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
