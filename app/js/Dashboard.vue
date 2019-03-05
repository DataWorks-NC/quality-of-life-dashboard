<template>
  <div class="mdl-layout__content">
    <div v-if="!printMode">
      <div class="mdl-grid">
        <tabs/>
        <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col">
          <div class="map-container" style="position: relative">
            <dashboard-map :mapbox-access-token="privateConfig.mapboxAccessToken" :map-config="mapConfig"/>
            <dashboard-legend/>
          </div>
          <div class="flexcontainer">
            <div class="flex-item mdl-typography--text-right">
              <year-slider/>
            </div>
            <undermap-buttons/>
          </div>
          <data-table/>
          <div class="demo-separator mdl-cell--1-col"/>
          <metadata/>
        </div>
        <div class="demo-cards mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-grid mdl-grid--no-spacing">
          <geography-switcher/>
          <div class="demo-separator mdl-cell--1-col"/>
          <distribution-chart/>
          <div class="demo-separator mdl-cell--1-col"/>
          <trend-chart/>
          <div class="demo-separator mdl-cell--1-col"/>
          <feedback/>
          <div class="demo-separator mdl-cell--1-col"/>
          <div class="mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop mdl-typography--text-center">
            <social/>
          </div>
        </div>
      </div>
      <div class="mdl-grid demo-cards">
        <div v-if="siteConfig.contactForm" class="mdl-typography--text-center mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet comment-container">
          <div class="comment-form">
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused">
              <input id="contact-email" class="mdl-textfield__input" type="email" required autocomplete="off">
              <label class="mdl-textfield__label" for="contact-email">Email Address</label>
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused">
              <textarea id="contact-message" class="mdl-textfield__input" type="text" rows="3" required autocomplete="off"/>
              <label class="mdl-textfield__label" for="contact-message">Message</label>
            </div>
            <p>
              <button id="contact-submit" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
                      style="display: inline">
                Contact Us
              </button>
            </p>
          </div>
          <div class="comment-complete">
            <p>
              <i class="material-icons">thumb_up</i><br> Thanks!
            </p>
          </div>
        </div>
      </div>
      <dashboard-footer/>
    </div>
    <div v-else>
      <h2>Print Mode!</h2>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import config from './modules/config';

import DataTable from './components/datatable.vue';
import DistributionChart from './components/distribution-chart.vue';
import Feedback from './components/feedback.vue';
import DashboardFooter from './components/dashboard-footer.vue';
import GeographySwitcher from './components/geography-switcher.vue';
import DashboardLegend from './components/dashboard-legend.vue';
import DashboardMap from './components/dashboard-map.vue';
import Metadata from './components/metadata.vue';
import Sidebar from './components/sidebar.vue';
import Social from './components/social.vue';
import Tabs from './components/tabs.vue';
import TrendChart from './components/trend-chart.vue';
import UndermapButtons from './components/undermap-buttons.vue';
import YearSlider from './components/year-slider.vue';

export default {
  name: 'Dashboard',
  components: {
    DataTable,
    DistributionChart,
    Feedback,
    DashboardFooter,
    GeographySwitcher,
    DashboardLegend,
    DashboardMap,
    Metadata,
    Sidebar,
    Social,
    Tabs,
    TrendChart,
    UndermapButtons,
    YearSlider,
  },
  data() {
    return {
      siteConfig: config.siteConfig,
      privateConfig: config.privateConfig,
      mapConfig: config.mapConfig,
    };
  },
  computed: mapState({
    printMode: 'printMode',
    urlHash(state) {
      if (!state.metricId || !state.geography.id) return '';
      return `${state.metricId}/${state.geography.id}/${state.selected.map(g => encodeURIComponent(g)).join(',')}`;
    },
  }),
  watch: {
    urlHash(newUrlHash) {
      location.hash = newUrlHash;
    },
  },
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
      let hashOffset = 0;

      if (getHash(0).toLowerCase() === 'print') {
        this.$store.commit('setPrintMode');
        hashOffset = 1;
      }

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

<style scoped>

</style>
