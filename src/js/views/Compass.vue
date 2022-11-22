<template>
  <div>
    <compass-nav v-if="!printMode" />
    <v-main :class="printMode ? 'print' : ''">
      <div v-if="!printMode">
        <v-container fluid grid-list-lg>
          <v-layout wrap>
            <v-row>
              <v-col cols="12" md="8">
                <v-card>
                  <div v-if="mapboxglLoaded" style="min-height: 600px;">
                    <ClientOnly>
                      <map-container
                        :map-config="config.mapConfig"
                      />
                    </ClientOnly>
                  </div>
                  <div v-else style="width: 600px; height:600px;" />
                  <div class="spacer" />
                  <div class="flex-container">
                    <year-slider v-if="metric.years.length > 1" />
                    <undermap-buttons />
                  </div>
                  <div class="spacer" />
                  <data-table />
                  <MetricMetadata :metric-id="$route.params.metric" :locale="$route.params.locale" />
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <geography-switcher />
                <div v-if="metric.config" class="spacer" />
                <distribution-chart :county-values="chartCountyValues" />
                <div v-if="metric.config && metric.years.length > 1" class="spacer" />
                <v-card
                  v-if="metric.config && metric.years.length > 1 && (chartValues || chartCountyValues)"
                >
                  <trend-chart
                    :metric-config="metric.config"
                    :years="metric.years.map(i => Number(i))"
                    :values="chartValues"
                    :county-values="chartCountyValues"
                    framework="mdl"
                  />
                </v-card>
                <div class="spacer" />
                <feedback />
                <div class="spacer" />
                <social />
              </v-col>
            </v-row>
          </v-layout>
        </v-container>
      </div>
      <div v-else>
        <print-mode :config="config" />
      </div>
    </v-main>
    <dashboard-footer />
  </div>
</template>

<script>
import { useHead } from '@vueuse/head';
import { defineAsyncComponent, computed } from 'vue';
import { store } from '../stores/compass-store.js';
import parseRouteMixin from '@/js/components/mixins/parseRouteMixin.js';

import config from "../modules/config";
import {calcValue, sum, wValsToArray} from '../modules/metric_calculations';

// TODO: Check which components have a heavier bundle and only make those ones async loaded.
import DashboardFooter from "../components/dashboard-footer.vue";
import DataTable from "../components/datatable.vue";
import Feedback from "../components/feedback.vue";
import GeographySwitcher from "../components/geography-switcher.vue";
import MetricMetadata from "../components/metric-metadata.vue";
import PrintMode from "../components/print-mode.vue";
import Social from "../components/social.vue";
import UndermapButtons from "../components/undermap-buttons.vue";
import CompassNav from "../components/CompassNav.vue";
import {fetchResponseJSON, fetchResponseJSONSync} from '@/js/modules/fetch.js';
import jenksBreaks from '@/js/modules/jenksbreaks.js';
import {gaEvent} from '@/js/modules/tracking.js';

const MapContainer = defineAsyncComponent(() => import("../components/map/MapContainer.vue"));
const DistributionChart = defineAsyncComponent(() => import("../components/distribution-chart.vue"));
const TrendChart = defineAsyncComponent(() => import("../components/trend-chart.vue"));
const YearSlider = defineAsyncComponent(() => import("../components/year-slider.vue"));

export default {
  name: "Compass",
  components: {
    CompassNav,
    DashboardFooter,
    DataTable,
    DistributionChart,
    Feedback,
    GeographySwitcher,
    MapContainer,
    MetricMetadata,
    PrintMode,
    Social,
    TrendChart,
    UndermapButtons,
    YearSlider,
  },
  mixins: [parseRouteMixin],
  inject: ['mapboxglLoaded',],
  provide() {
    return {
      metric: computed(() => this.metric),
      geography: computed(() => this.geography),
      breaks: computed(() => this.breaks),
      selected: computed(() => this.selected),
      selectGroupName: computed(() => this.selectGroupName),
      selectGroupType: computed(() => this.selectGroupType),
      printMode: computed(() => this.printMode),
    };
  },
  setup() {
  },
  data() {
    return {
      config,
      metric: {
        id: null,
        config: {},
        years: [],
        averageValues: {},
        loaded: false,
      },
      breaks: [],
      printMode: false,
      store,
    }
  },
  computed: {
    chartValues() {
      if (!this.selected.length || this.metric.years.length <= 1) return {};
      const metricValues = {};
      for (let i = 0; i < this.metric.years.length; i += 1) {
        metricValues[this.metric.years[i]] = calcValue(
          this.metric.data,
          this.metric.config.type,
          this.metric.years[i],
          this.selected,
        );
      }
      return metricValues;
    },
    chartCountyValues() {
      const averageValues = {};
      const years = Object.keys(this.metric.averageValues);
      for (let i = 0; i < years.length; i += 1) {
        averageValues[years[i]] = this.metric.averageValues[years[i]].value;
      }
      return averageValues;
    },
  },
  watch: {
    printMode() {
      this.setPrintClass();
    },
  },
  created() {
    this.initFromRoute();
    this.$watch(() => this.$route.params, (newParams, oldParams) => {
      this.initFromRoute(newParams.metric !== oldParams.metric, newParams.geographyLevel !== oldParams.geographyLevel);
    });
    this.$watch(() => this.$route.query.printMode, (newMode) => {
      this.printMode = newMode;
      this.setPrintClass();
    });

    this.setMetadata();
  },
  mounted() {
    this.setPrintClass();
  },
  methods: {
    setMetadata() {
      const metricTitle = this.$i18n.locale === 'es'
        ? this.metric.config.title_es
        : this.metric.config.title;
      const geographyName = this.geography.id && this.geography.id.length > 0
        ? ` (${this.$t(`geographies.${this.geography.id}.name`)})`
        : '';

      let title = `${metricTitle}${geographyName} - ${this.$t('strings.DurhamNeighborhoodCompass')}`;
      const meta = [
        {
          name: 'og:title',
          content: title,
        }
      ];
      if (this.printMode) {
        title = `${title} - ${this.$t('undermapButtons.printEmbed')}`;
        meta.push({
          name: 'description',
          content: `${this.$t('strings.metaDescriptionPrint', [
           metricTitle.toLocaleLowerCase(this.$i18n.locale),
           geographyName.toLocaleLowerCase(this.$i18n.locale),
         ])}`
        });
      }

      useHead({
        title: title,
        meta,
      });
    },
    initFromRoute(metricChanged = true, geographyChanged = true) {
      // Base metric info.
      const metricId = this.$route.params.metric;

      this.metric.id = metricId;
      this.metric.config = config.dataConfig[`m${metricId}`];

      this.printMode = this.$route.query.mode === 'print';

      // Load metric data.
      if (metricChanged) {
        gaEvent('metric',
          this.metric.config.title.trim(),
          this.metric.config.category.trim());
      }
      if (geographyChanged) {
        this.store.highlight = [];
      }
      if (metricChanged || geographyChanged) {
        this.loadMetricData();
      }
    },
    async loadMetricData() {
      if (!this.metric.id || !this.geography.id) return;

      const path = `/data/metric/${this.geography.id}/m${this.metric.id}.json`;

      let metricJSON = {};
      if (import.meta.env.SSR) {
        metricJSON = fetchResponseJSONSync(path);
      }
      else {
        metricJSON = await fetchResponseJSON(path);
      }
      if (!metricJSON) {
        return;
      }

      const nKeys = Object.keys(metricJSON.map);
      const yKeys = Object.keys(metricJSON.map[nKeys[0]]);
      const years = yKeys.map(el => el.replace('y_', ''));

      // drop invalid selected values
      // TODO: is this even needed?
      // const selected = state.selected.filter(id => nKeys.indexOf(id) > 0);
      // if (selected.length !== state.selected.length) {
      //   commit('setSelected', selected);
      // }

      // Calculate average values.
      const keys = Object.keys(metricJSON.map);
      const averageValues = {};
      years.forEach((year) => {
        let areaValue = null;
        let areaValueRaw = null;
        if (this.metric.config.world_val
          && this.metric.config.world_val[`y_${year}`]) {
          areaValue = this.metric.config.world_val[`y_${year}`];
        } else {
          areaValue = calcValue(metricJSON, this.metric.config.type, year, keys);
        }
        if (this.metric.config.raw_label) {
          const rawArray = wValsToArray(metricJSON.map,
            metricJSON.w, [year], keys);
          let rawValue = sum(rawArray);
          if (this.metric.config.suffix === '%') {
            rawValue /= 100;
          }
          areaValueRaw = rawValue;
        }
        averageValues[year] = { value: areaValue, rawValue: areaValueRaw };
      });

      this.metric.years = years;
      this.metric.data = metricJSON;
      this.metric.averageValues = averageValues;
      this.store.year = years[years.length - 1];
      this.breaks = jenksBreaks(metricJSON.map, years, nKeys, 5);
      this.metric.loaded = true;
    },
    setPrintClass() {
      // Add print mode class to body.
      if (this.printMode) {
        document.getElementsByTagName("body")[0].classList.add("print");
        const mdlMainFrame = document.getElementById("mdl-main-frame");
        if (mdlMainFrame) {
          mdlMainFrame.scrollTo(0, 0); // Scroll to top.
        }
      } else {
        document.getElementsByTagName("body")[0].classList.remove("print");
      }
    },
  },
};
</script>
