<template>
  <v-card id="summary" v-observe-visibility="visibilityOptions" class="page page-front">
    <v-row>
      <v-col>
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
      <v-col cols="12" sm="6">
        <i18n path="reportSummary.about[0]" tag="p">
          <a place="compassLink" href="/">
            <span class="link-underline">{{ $t('strings.DurhamNeighborhoodCompass') }}</span>
          </a>
        </i18n>
        <i18n path="reportSummary.about[1]" tag="p" />
        <i18n path="reportSummary.about[2]" tag="p" />
      </v-col>
      <v-col cols="12" sm="6">
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
            <v-card v-for="metric in summaryMetrics" :key="metric.metric" flat>
              <p class="stat-category">
                <a
                  v-scroll-to="{ el: `#${formatAnchor(metric.category)}`, offset: -60 }"
                  class="stat-category-link"
                >{{ $t(`strings.metricCategories.${metric.category}`) }}</a>
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
import { mapMutations } from "vuex";
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
  data() {
    return {
      visibilityOptions: {
        callback: this.categoryVisible,
        intersection: {
          threshold: 0.1,
        },
      },
    };
  },
  methods: {
    ...mapMutations(["setActiveCategory"]),
    prettyValue(metric) {
      return prettyNumber(
        metric.value,
        metric.decimals,
        metric.prefix,
        metric.suffix,
      );
    },
    categoryVisible(isVisible, entry) {
      if (!isVisible) {
        return;
      }
      this.setActiveCategory(`${entry.target.id}`);
    },
    formatAnchor(category) {
      return category.toLowerCase().replace(/\s/g, "-");
    },
  },
};
</script>

<style lang="scss" scoped>
.page.page-front {
  padding: 10px 25px;
}
.logo-image {
  height: 98px;
  width: 408px;

  @media (max-width: 767px) {
    width: 100%;
    height: auto;
  }
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
.v-card {
  p {
    margin: 0;

    &.stat-category a {
      font-size: 1.25em;
      text-transform: uppercase;
      color: var(--v-primary-base);
      font-weight: 700;
      text-decoration: none;
      position: relative;
      &:hover {
        &::before {
          content: "#";
          position: absolute;
          left: -20px;
          color: rgba(0, 0, 0, 0.15);
        }
      }
    }

    &.highlighted-stat {
      font-size: 1.5em;
      font-weight: 600;
    }
  }

  &.v-card--flat {
    border-radius: 0;
    padding-bottom: 15px;
    padding: 25px 35px;
    width: 33%;
    @media (min-width: 768px) {
      &:nth-child(-n + 3) {
        border-bottom: 1px solid #dce8ec;
      }
      &:nth-child(3n + 2) {
        border-left: 1px solid #dce8ec;
        border-right: 1px solid #dce8ec;
      }
    }
    @media (max-width: 767px) {
      width: 100%;
      & + .v-card--flat {
        border-top: 1px solid #dce8ec;
      }
    }
  }
}
</style>
