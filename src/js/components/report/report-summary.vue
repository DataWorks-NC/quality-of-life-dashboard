<template>
  <v-card class="page page-front">
    <v-row>
      <v-col xs="12">
        <img
          class="logo-image"
          :src="require('../../../assets/img/report-logo.png')"
          :alt="$t('strings.DurhamNeighborhoodCompass')"
        >
        <h2 class="subtitle">
          {{ reportTitle }}
        </h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col sm="6">
        <i18n path="reportSummary.about[0]" tag="p">
          <a place="compassLink" href="/">
            <span class="link-underline">{{ $t('strings.DurhamNeighborhoodCompass') }}</span>
          </a>
        </i18n>
        <i18n path="reportSummary.about[1]" tag="p" />
        <i18n path="reportSummary.about[2]" tag="p" />
      </v-col>
      <v-col sm="6">
        <ReportMap
          :map-config="mapConfig"
          :geography-id="geographyId"
          :selected-geographies="selected"
        />
      </v-col>
    </v-row>
    <v-row id="metric-summary-box" class="metric-box">
      <v-col cols="12" class="text-center">
        <v-container>
          <v-row no-gutters align="stretch">
            <v-card v-for="metric in summaryMetrics" :key="metric.metric" width="33%" flat>
              <p class="stat-category">
                {{ $t(`strings.metricCategories.${metric.category}`) }}
              </p>
              <p
                class="highlighted-stat"
              >
                {{ prettyValue(metric) }} {{ metric.raw_label ? $t(`metricLabels['${metric.raw_label}']`) : '' }}
              </p>
              <p>{{ $i18n.locale === 'es' ? metric.title_es : metric.title }}</p>
            </v-card>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { prettyNumber } from "../../modules/number_format";

const ReportMap = () => import(/* webpackChunkName: "report-map" */ "./report-map.vue");

export default {
  name: "ReportSummary",
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
      default: "tract",
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
      default: "",
    },
  },
  methods: {
    prettyValue(metric) {
      return prettyNumber(
        metric.value,
        metric.decimals,
        metric.prefix,
        metric.suffix,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.page.page-front {
  padding: 10px 20px;
}
.logo-image {
  height: 98px;
}
.subtitle {
  font-size: 1.5em;
  font-weight: 700;
  position: relative;
  margin-top: 0.75em;
  margin-bottom: 0.75em;
  text-transform: uppercase;

  &::after {
    content: "";
    width: 150px;
    height: 3px;
    background-color: var(--v-primary-base);
    position: absolute;
    bottom: -10px;
    left: 0;
  }
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
.v-card {
  p {
    margin: 0;

    &.stat-category {
      font-size: 1.25em;
      text-transform: uppercase;
      color: var(--v-primary-base);
      font-weight: 700;
    }

    &.highlighted-stat {
      font-size: 1.5em;
      font-weight: 600;
    }
  }
  &.v-card--flat {
    border-radius: 0;
    padding-bottom: 15px;
    &:nth-child(-n + 3) {
      border-bottom: 1px solid #dce8ec;
    }
    &:nth-child(3n + 2) {
      border-left: 1px solid #dce8ec;
      border-right: 1px solid #dce8ec;
    }
  }
}
</style>
