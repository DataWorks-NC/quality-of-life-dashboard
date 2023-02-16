<template>
  <v-card id="summary-container" class="page page-front" data-category="Summary">
    <v-row>
      <v-col>
        <img
          class="logo-image"
          src="@/assets/img/report-logo.png"
          :alt="$t('strings.DurhamNeighborhoodCompass')"
        >
        <h1 class="subtitle">
          {{ reportTitle }}
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <i18n-t keypath="reportSummary.about[0]" tag="p">
          <a place="compassLink" href="/">
            <span class="link-underline">{{ $t('strings.DurhamNeighborhoodCompass') }}</span>
          </a>
        </i18n-t>
        <i18n-t keypath="reportSummary.about[1]" tag="p" />
        <i18n-t keypath="reportSummary.about[2]" tag="p" />
      </v-col>
      <v-col cols="12" sm="6">
        <MapboxProvider :min-height="400">
          <ReportMap />
        </MapboxProvider>
      </v-col>
    </v-row>
    <v-row id="metric-summary-box" class="metric-box">
      <v-col cols="12" class="text-center">
        <v-container>
          <v-row no-gutters align="stretch">
            <v-card v-for="metric in summaryMetrics" :key="metric.metric" flat>
              <p class="stat-category">
                <a
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
import { defineAsyncComponent} from 'vue';
import { prettyNumber } from "../../helpers/numberFormat.js";

const MapboxProvider = defineAsyncComponent(() => import('../map/MapboxProvider.vue'));
const ReportMap = defineAsyncComponent(() => import("./ReportMap.vue"));

export default {
  name: "ReportSummary",
  components: {
    ReportMap,
    MapboxProvider
  },
  inject: ['reportTitle', 'intersectionObserver'],
  props: {
    summaryMetrics: {
      type: Array,
      default: () => [],
    },
    geographyId: {
      type: String,
      default: "tract",
    },
  },
  data() {
    return {
      isObserved: false,
    };
  },
  computed: {
    summaryId() {
      return this.$t('strings.metricCategories.Summary').toLowerCase();
    },
  },
  mounted() {
    if (this.intersectionObserver) {
      this.isObserved = true;
      this.intersectionObserver.observe(
        document.getElementById('summary-container')
      );
    }
  },
  updated() {
    if (this.intersectionObserver && !this.isObserved) {
      this.isObserved = true;
      this.intersectionObserver.observe(
        document.getElementById('summary-container')
      );
    }
  },
  methods: {
    prettyValue(metric) {
      return prettyNumber(
        metric.value,
        metric,
      );
    },
    categoryVisible(isVisible, entry) {
      if (!isVisible) {
        return;
      }
      this.activeCategory = entry.target.id;
    },
    formatAnchor(category) {
      return category.toLowerCase().replace(/\s/g, "-");
    },
    getAnchor(categoryName) {
      return `#${this.formatAnchor(this.$t(`strings.metricCategories['${categoryName}']`))}`;
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
    padding: 25px 35px;
    padding-bottom: 15px;
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
