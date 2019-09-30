<template>
  <div>
    <compass-nav v-if="!printMode" />
    <v-content :class="printMode ? 'print' : ''">
      <div v-if="!printMode">
        <v-container fluid grid-list-lg>
          <v-layout wrap>
            <v-flex sm12 md8>
              <div v-if="metric.config">
                <v-card>
                  <div class="map-container">
                    <dashboard-map :mapbox-access-token="config.privateConfig.mapboxAccessToken"
                                   :map-config="config.mapConfig"
                    />
                    <dashboard-legend />
                  </div>
                  <v-spacer />
                  <div class="flex-container">
                    <year-slider v-if="metric.years.length > 1" />
                    <undermap-buttons />
                  </div>
                  <v-spacer />
                  <data-table />
                  <Metadata />
                </v-card>
              </div>
              <div v-else>
                <v-card>
                  <div class="flexcontainer landing-page">
                    <div class="flex-item">
                      <h2>{{ $t('welcome.title') }}</h2>
                      <div v-if="$i18n.locale === 'es'">
                        <div>
                          <p><b>Cómo usarlo:</b></p>
                          <div>
                            <img :src="require('../../assets/img/Choose_Metric-es.png')" alt="">
                            <b>Elija un tema</b> del menú en la parte superior de la página (en teléfono
                            celular, toque las tres líneas que se encuentran en la parte superior
                            izquierda para abrir el menú)
                          </div>
                          <div>
                            <img :src="require('../../assets/img/Find_Neighborhood-es.png')" alt=""><b>Encuentre
                              una dirección o vecindario</b> usando la barra de búsqueda ubicada en el mapa
                          </div>
                          <div>
                            <img :src="require('../../assets/img/Create_Report-es.png')" alt=""><b>Genere
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
                </v-card>
              </div>
            </v-flex>
            <v-flex sm12 md4>
              <geography-switcher v-if="metric.config" />
              <v-spacer v-if="metric.config" />
              <distribution-chart v-if="metric.config" :county-values="chartCountyValues" />
              <v-spacer v-if="metric.config && metric.years.length > 1" />
              <v-card v-if="metric.config && metric.years.length > 1 && (chartValues || chartCountyValues)">
                <trend-chart :metric-config="metric.config" :years="metric.years.map(i => Number(i))"
                             :values="chartValues" :county-values="chartCountyValues" framework="mdl"
                />
              </v-card>
              <v-spacer v-if="metric.config" />
              <feedback />
              <v-spacer />
              <social />
            </v-flex>
          </v-layout>
        </v-container>
      </div>
      <div v-else>
        <print-mode :config="config" />
      </div>
    </v-content>
    <dashboard-footer />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import config from '../modules/config';
import { calcValue } from '../modules/metric_calculations';

import DashboardFooter from '../components/dashboard-footer.vue';
import DataTable from '../components/datatable.vue';
import Feedback from '../components/feedback.vue';
import GeographySwitcher from '../components/geography-switcher.vue';
import DashboardLegend from '../components/dashboard-legend.vue';
import Metadata from '../components/metadata.vue';
import PrintMode from '../components/print-mode.vue';
import Social from '../components/social.vue';
import UndermapButtons from '../components/undermap-buttons.vue';
import CompassNav from '../components/CompassNav';

const DashboardMap = () => import(/* webpackChunkName: "dashboard-map" */ '../components/dashboard-map.vue');
const DistributionChart = () => import(/* webpackChunkName: "distribution-chart" */'../components/distribution-chart.vue');
const TrendChart = () => import(/* webpackChunkName: "trend-chart" */'../components/trend-chart.vue');
const YearSlider = () => import(/* webpackChunkName: "year-slider" */'../components/year-slider.vue');

export default {
  name: 'Dashboard',
  components: {
    CompassNav,
    DashboardFooter,
    DataTable,
    DistributionChart,
    Feedback,
    GeographySwitcher,
    DashboardLegend,
    DashboardMap,
    Metadata,
    PrintMode,
    Social,
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
  .map-container {
    min-height: 600px;
  }
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
