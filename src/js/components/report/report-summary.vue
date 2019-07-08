<template functional>
  <div class="page page-front">
    <div class="row">
      <div class="col-xs-12">
        <img class="logo-image" src="img/report-logo.png" :alt="$t('strings.DurhamneighborhoodCompass')">
        <h2 class="subtitle">{{ reportTitle }}</h2>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6">
        <i18n path="reportSummary.about[0]" tag="p">
          <a place="compassLink" href="/">{{ $t('strings.DurhamNeighborhoodCompass') }}</a>
        </i18n>
        <i18n path="reportSummary.about[1]" tag="p"/>
        <i18n path="reportSummary.about[2]" tag="p"/>
      </div>
      <div class="col-sm-6">
        <ReportMap :map-config="mapConfig" :geography-id="geographyId" :selected-geographies="areaIds"/>
      </div>
    </div>
    <div id="metric-summary-box" class="row">
      <div class="col-xs-12 text-center">
        <table class="metric-box">
          <tbody>
            <tr>
              <td v-for="metric in summaryMetrics.slice(0,3)" :key="metric.metric">
                <h2>{{ metric.category }}</h2>
                <h3>{{ prettyValue(metric) }} {{ metric.raw_label }}</h3>
                <h4>{{ metric.title }}</h4>
              </td>
            </tr>
            <tr>
              <td v-for="metric in summaryMetrics.slice(3,6)" :key="metric.metric">
                <h2>{{ metric.category }}</h2>
                <h3>{{ prettyValue(metric) }} {{ metric.raw_label }}</h3>
                <h4>{{ metric.title }}</h4>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import ReportMap from './report-map';
import { prettyNumber } from '../../modules/number_format';

export default {
  name: 'ReportSummary',
  components: {
    ReportMap,
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
