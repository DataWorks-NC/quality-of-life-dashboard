<template functional>
  <div class="mdl-grid">
    <print-map-header/>
    <img src="./img/report-logo.png" alt="DataWorks NC logo" class="header__logo">
    <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
      <main class="map-container" style="position: relative">
        <dashboard-map :mapbox-access-token="privateConfig.mapboxAccessToken" :map-config="mapConfig"/>
        <dashboard-legend/>
      </main>
      <footer>Map from the Durham Neighborhood Compass, a project of DataWorks NC. Visit <a href="https://compass.durhamnc.gov">the compass</a> to build your own map!</footer>
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
    'mapConfig',
    'privateConfig',
  ],
};
</script>

<style>
.print .mdl-grid {
  max-width: 8in;
  padding: 0.25in;
}

.print .map-container {
  height: 8in;
}

.print #map {
  height: 8in;
}

.print footer {
  font-size: 8pt;
  padding: 0.125in;
  font-style: italic;
}

.header__logo {
  display: none;
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
</style>
