<template>
  <v-card class="page page-front">
    <v-row>
      <v-col xs="12">
        <img class="logo-image" :src="require('../../../assets/img/report-logo.png')" :alt="$t('strings.DurhamNeighborhoodCompass')">
        <h2 class="subtitle">
          {{ reportTitle }}
        </h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col sm="6">
        <i18n path="reportSummary.about[0]" tag="p">
          <a place="compassLink" href="/">{{ $t('strings.DurhamNeighborhoodCompass') }}</a>
        </i18n>
        <i18n path="reportSummary.about[1]" tag="p" />
        <i18n path="reportSummary.about[2]" tag="p" />
      </v-col>
      <v-col sm="6">
        <ReportMap :map-config="mapConfig" :geography-id="geographyId" :selected-geographies="selected" />
      </v-col>
    </v-row>
    <v-row id="metric-summary-box">
      <v-col cols="12" class="text-center">
        <v-container>
          <v-row no-gutters align="stretch">
            <v-col v-for="metric in summaryMetrics" :key="metric.metric" cols="4">
              <v-card outlined tile>
                <h2>{{ $t(`strings.metricCategories.${metric.category}`) }}</h2>
                <h3>{{ prettyValue(metric) }} {{ metric.raw_label ? $t(`metricLabels['${metric.raw_label}']`) : '' }}</h3>
                <h4>{{ $i18n.locale === 'es' ? metric.title_es : metric.title }}</h4>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { prettyNumber } from '../../modules/number_format';

const ReportMap = () => import(/* webpackChunkName: "report-map" */ './report-map.vue');

export default {
  name: 'ReportSummary',
  components: {
    ReportMap,
  },
  props: {
    summaryMetrics: {
      type: Array,
      default: () => [],
    },
    geographyId: {
      type: String,
      default: 'tract',
    },
    selected: {
      type: Array,
      default: () => [],
    },
    mapConfig: {
      type: Object,
      default: () => ({}),
    },
    reportTitle: {
      type: String,
      default: '',
    },
  },
  methods: {
    prettyValue(metric) {
      return prettyNumber(metric.value, metric.decimals, metric.prefix, metric.suffix);
    },
  },
};
</script>

<style scoped>
.logo-image {
    height: 98px;
}
.subtitle {
    font-size: 1.5em;
    font-weight: bold;
    border: none;
    border-bottom: 1px dashed #ccc;
    -webkit-box-shadow: none;
    box-shadow: none;
    padding: 8px 2px 2px;
    text-shadow: 1px 1px 1px #ccc;
    background: none;
    height: 38px;
}
.logo-image {
    width: 408px;
}
.hero {
    height: 120px;
}
.subhero {
    position: absolute;
    top: 55px;
    left: 105px;
    right: 20px;
}
h1 {
    font-size: 2.8em;
    text-shadow: 1px 1px 1px #ccc;
    margin: 10px 0 0;
}
h4 {
    margin-top: 5px;
    font-size: 1em;
}
.metric-box {
    width: 100%;
    border-collapse: collapse;
    border-style: hidden;
}
.metric-box td {
    border: 2px solid #dddddd;
}
.metric-box td h2 {
    font-size: 1.2em;
    text-transform: uppercase;
}
.metric-box td h3 {
    font-size: 2.5em;
    text-shadow: 1px 1px 1px #ccc;
}
.metric-box td h4 {
    font-size: 0.9em;
}
</style>
