<template>
  <div>
    <div class="demo-layout mdl-layout mdl-js-layout mdl-layout--fixed-header">
      <header class="mdl-layout__header mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
        <div aria-label="sidebar menu" aria-expanded="false" role="button" tabindex="0" class="mdl-layout__drawer-button">
          <svg class="icon icon-menu mdl-color-text--blue-grey-50"><use xmlns:xlink="https://www.w3.org/1999/xlink" xlink:href="#icon-menu"/></svg>
        </div>
        <div class="mdl-layout__header-row">
          <span class="mdl-layout-title"><a href="./"><img src="img/logo.png" alt="TITLE GOES HERE"></a></span>
          <div class="mdl-layout-spacer"/>
          <div class="header-nav" style="height: 54px;">
            <nav class="mdl-navigation">
              <a class="mdl-navigation__link mdl-typography--text-uppercase mdl-color-text--blue-grey-50" onclick="ga('send', 'event', 'download', 'metric zip file download')" href="downloads/qol-data.zip">Download Data</a>
            </nav>
          </div>
        </div>
      </header>
      <Sidebar/>
    </div>
    <div class="mdl-layout__content">
      <div class="mdl-grid">
        <tabs/>
        <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col">
          <div class="map-container" style="position: relative">
            <dashboard-map :mapboxAccessToken="privateConfig.mapboxAccessToken" :mapConfig="mapConfig"/>
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
          <distribution-chart></distribution-chart>
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
      <footer/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import DataTable from './components/datatable.vue';
import DistributionChart from './components/distribution-chart.vue';
import Feedback from './components/feedback.vue';
import Footer from './components/footer.vue';
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
    Footer,
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
  computed: mapState({
    siteConfig: 'siteConfig',
    privateConfig: 'privateConfig',
    mapConfig: 'mapConfig',
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
  mounted() {
    // Check if there is an existing hash and use it, otherwise redirect to a random metric.

    if (location.hash) {
      // Helper function to get the current page hash.
      function getHash(pos = 0) {
        let hash = decodeURI(location.hash).split('/');
        if (hash[pos] && hash[pos].length > 0) {
          hash[pos] = hash[pos].toString().replace('#', '');
          return decodeURIComponent(hash[pos]);
        } else {
          return false;
        }
      }

      // Hash has the form #metricId/geographyId/selectedid1,selectedid2
      if (getHash(1)) {
        this.$store.commit('setGeographyId', getHash(1));
      }
      if (getHash(2)) {
        this.$store.commit('setSelected', getHash(2).split(','));
      }
      this.$store.dispatch('changeMetric', getHash(0));
    }
    else {
      this.$store.dispatch('randomMetric');
    }
  },
};
</script>

<style scoped>

</style>
