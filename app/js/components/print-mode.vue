<template functional>
  <div class="mdl-grid">
    <print-map-header/>
    <img src="./img/report-logo.png" alt="DataWorks NC logo" class="header__logo">
    <div class="map mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
      <main class="map-container" style="position: relative">
        <dashboard-map :mapbox-access-token="config.privateConfig.mapboxAccessToken" :map-config="Object.assign({ trackResize: false }, config.mapConfig)"/>
        <dashboard-legend/>
      </main>
      <footer>Map from the Durham Neighborhood Compass, a project of DataWorks NC. Visit <a href="https://compass.durhamnc.gov">the compass</a> to build your own map!</footer>
    </div>
    <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
      <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty">
        <textarea :value="embedcode" id="embedcode" class="mdl-textfield__input" type="text" name="embedcode" maxlength="200" aria-label="Copy code to embed this map in another website" onclick="this.select()" ref="embedcode" rows="3"></textarea>
        <label for="embedcode" class="mdl-textfield__label">Or, use the following code to embed this map in another website</label>
      </div>
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
  computed: {
    embedcode() {
      return `<iframe id="nbhdCompassMap" style="width: 100%; max-width: 600px; min-width: 250px; height: 600px; min-height: 600px; margin-top: 10px; margin-bottom: 10px; display: block; border-width: 0px;" scrolling="yes" src="${this.config.siteConfig.qoldashboardURL}embed.html#${this.$store.getters.urlHash.replace('print/','')}"></iframe>`;
    },
  },
  mounted() {
    this.$refs.embedcode.dispatchEvent(new Event('input'));
  },
  updated() {
    this.$refs.embedcode.dispatchEvent(new Event('input'));
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
  max-width: 8in;
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

.mdl-textfield {
  width: 90%;
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

  .mdl-cell {
    display: none;
  }
}

@page {
  size: letter portrait;
}
</style>
