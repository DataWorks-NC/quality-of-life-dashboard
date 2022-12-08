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
                      <map-container />
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
        <print-mode />
      </div>
    </v-main>
    <dashboard-footer />
  </div>
</template>

<script>
import { useHead } from '@vueuse/head';
import { defineAsyncComponent, computed } from 'vue';
import parseRouteMixin from '@/js/components/mixins/parseRouteMixin.js';
import loadMetricDataMixin from '@/js/components/mixins/loadMetricDataMixin.js';
import {calcValue} from '../modules/metric_calculations';

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
  mixins: [parseRouteMixin, loadMetricDataMixin],
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
      legendTitle: computed(() => this.legendTitle),
    };
  },
  setup() {
  },
  data() {
    return {
      printMode: false,
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
