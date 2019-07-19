<template>
  <div id="mdl-main-frame" class="mdl-layout__content" :class="printMode ? 'print' : ''">
    <div v-if="!printMode">
      <div class="mdl-grid">
        <tabs />
        <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col">
          <div v-if="metric.config">
            <div class="map-container" style="position: relative">
              <dashboard-map :mapbox-access-token="config.privateConfig.mapboxAccessToken"
                             :map-config="config.mapConfig"
              />
              <dashboard-legend />
            </div>
            <div class="flexcontainer">
              <div class="flex-item mdl-typography--text-right">
                <year-slider />
              </div>
              <undermap-buttons />
            </div>
            <data-table />
            <div class="demo-separator mdl-cell--1-col" />
            <Metadata />
          </div>
          <div v-else>
            <div class="flexcontainer landing-page">
              <div class="flex-item">
                <h2>{{ $t('welcome.title') }}</h2>
                <div v-if="$i18n.locale === 'es'">
                  <div>
                    <p><b>Cómo usarlo:</b></p>
                    <div>
                      <img :src="require('../../assets/img/Choose_Metric.png')" alt="">
                      <b>Elija un tema</b> del menú en la parte superior de la página (en teléfono
                      celular, toque las tres líneas que se encuentran en la parte superior
                      izquierda para abrir el menú)
                    </div>
                    <div>
                      <img :src="require('../../assets/img/Find_Neighborhood.png')" alt=""><b>Encuentre
                        una dirección o vecindario</b> usando la barra de búsqueda ubicada en el mapa
                    </div>
                    <div>
                      <img :src="require('../../assets/img/Create_Report.png')" alt=""><b>Genere
                        un informe</b> haciendo clic en el botón “Informe”
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div>
                    <p><b>Here's how to get started:</b></p>
                    <div>
                      <img :src="require('../../assets/img/Choose_Metric.png')" alt="">
                      <b>Choose a topic</b> from the menu at top (on a mobile device, tap the three
                      lines at the top-left to open the menu)
                    </div>
                    <div>
                      <img :src="require('../../assets/img/Find_Neighborhood.png')" alt=""><b>Find
                        an address or neighborhood</b> using the address search tool on the map
                    </div>
                    <div>
                      <img :src="require('../../assets/img/Create_Report.png')" alt=""><b>Make a
                        report</b> by clicking the "Report" button
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="demo-cards mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-grid mdl-grid--no-spacing"
        >
          <geography-switcher v-if="metric.config" />
          <div v-if="metric.config" class="demo-separator mdl-cell--1-col" />
          <distribution-chart v-if="metric.config" />
          <div v-if="metric.config" class="demo-separator mdl-cell--1-col" />
          <trend-chart v-if="metric.config && metric.years && (chartValues || chartCountyValues)"
                       :metric-config="metric.config" :years="metric.years.map(i => Number(i))"
                       :values="chartValues" :county-values="chartCountyValues" framework="mdl"
          />
          <div v-if="metric.config" class="demo-separator mdl-cell--1-col" />
          <feedback />
          <div class="demo-separator mdl-cell--1-col" />
          <div
            class="mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop mdl-typography--text-center"
          >
            <social />
          </div>
        </div>
        <div class="mdl-grid demo-cards">
          <div v-if="config.siteConfig && config.siteConfig.contactForm"
               class="mdl-typography--text-center mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet comment-container"
          >
            <div class="comment-form">
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused">
                <input id="contact-email" class="mdl-textfield__input" type="email" required
                       autocomplete="off"
                >
                <label class="mdl-textfield__label" for="contact-email">Email Address</label>
              </div>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused">
                <textarea id="contact-message" class="mdl-textfield__input" type="text" rows="3"
                          required autocomplete="off"
                />
                <label class="mdl-textfield__label" for="contact-message">Message</label>
              </div>
              <p>
                <button id="contact-submit"
                        class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
                        style="display: inline"
                >
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
        <dashboard-footer />
      </div>
    </div>
    <div v-else>
      <print-mode :config="config" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import config from '../modules/config';
import { calcValue } from '../modules/metric_calculations';

import DataTable from '../components/datatable.vue';
import DistributionChart from '../components/distribution-chart.vue';
import Feedback from '../components/feedback.vue';
import DashboardFooter from '../components/dashboard-footer.vue';
import GeographySwitcher from '../components/geography-switcher.vue';
import DashboardLegend from '../components/dashboard-legend.vue';
import Metadata from '../components/metadata.vue';
import PrintMode from '../components/print-mode.vue';
import Social from '../components/social.vue';
import Tabs from '../components/tabs.vue';
import TrendChart from '../components/trend-chart.vue';
import UndermapButtons from '../components/undermap-buttons.vue';
import YearSlider from '../components/year-slider.vue';

const DashboardMap = () => import(/* webpackChunkName: "dashboard-map" */ '../components/dashboard-map.vue');

require('material-design-lite');

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
    PrintMode,
    Social,
    Tabs,
    TrendChart,
    UndermapButtons,
    YearSlider,
  },
  data: () => ({
    config,
  }),
  computed: Object.assign(
    mapState({
      printMode: 'printMode',
      metric: 'metric',
      chartValues(state) {
        if (!state.selected.length || state.metric.years.length <= 1) return {};
        const metricValues = {};
        for (let i = 0; i < state.metric.years.length; i += 1) {
          metricValues[state.metric.years[i]] = calcValue(state.metric.data,
            state.metric.config.type,
            state.metric.years[i], state.selected);
        }
        return metricValues;
      },
      chartCountyValues(state) {
        const averageValues = {};
        const years = Object.keys(state.metric.averageValues);
        for (let i = 0; i < years.length; i += 1) {
          averageValues[years[i]] = state.metric.averageValues[years[i]].value;
        }
        return averageValues;
      },
    }),
  ),
  watch: {
    printMode() {
      this.setPrintClass();
    },
  },
  mounted() {
    this.setPrintClass();
    // Force material design lite to register dynamic components in the DOM *after* dashboard has loaded.
    // componentHandler is a global defined by the material design library at load time.
    /* eslint-disable no-undef */
    if (typeof componentHandler !== 'undefined' && 'upgradeDom' in componentHandler) {
      componentHandler.upgradeDom();
    }
    /* eslint-enable no-undef */

    this.$nextTick(() => {
      let event;
      if (typeof Event === 'function') {
        event = new Event("x-app-rendered");
      } else {
        event = document.createEvent('Event');
        event.initEvent('x-app-rendered', true, true);
      }
      document.dispatchEvent(event);
    });
  },
  methods: {
    setPrintClass() {
      // Add print mode class to body.
      if (this.printMode) {
        document.getElementsByTagName('body')[0].classList.add('print');
        const mdlMainFrame = document.getElementById('mdl-main-frame');
        if (mdlMainFrame) {
          mdlMainFrame.scrollTo(0, 0); // Scroll to top.
        }
      } else {
        document.getElementsByTagName('body')[0].classList.remove('print');
      }
    },
  },
};
</script>

<style scoped>
  .landing-page, .landing-page p {
    font-size: 18px;
  }

  .landing-page div {
    overflow: auto;
    margin: 1em 0;
  }

  .landing-page img {
    display: block;
    float: right;
    margin-left: 1em;
  }

  .landing-page h2 {
    font-size: 24px;
    margin-top: 0;
  }

  .landing-page b {
    color: rgb(0, 104, 139);
  }
</style>
