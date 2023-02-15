<template>
  <v-row justify="center">
    <v-btn variant="text" @click.stop="dialog = !dialog">
      {{ $t('reportSelector.customize') }}
    </v-btn>
    <v-dialog
      v-model="dialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
      class="metric-selector"
    >
      <v-card class="metric-selector">
        <v-toolbar dark>
          <v-btn icon @click="dialog = false">
            <v-icon :icon="mdiClose" />
          </v-btn>
          <v-toolbar-title>{{ $t('reportSelector.customize') }}</v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-row>
            <v-col>
              {{ $t('reportSelector.instructionsIntro') }}
              <ul>
                <li>{{ $t('reportSelector.instructions[0]') }}</li>
                <li>{{ $t('reportSelector.instructions[1]') }}</li>
                <i18n-t keypath="reportSelector.instructions[2]" tag="li">
                  <router-link
                    :to="store.lastCompassRoute ? store.lastCompassRoute : { name: 'homepage', params: $route.params, query: { selected: $route.query.selected } }"
                  >
                    {{ $t('reportSelector.goBack') }}
                  </router-link>
                </i18n-t>
                <li>
                  {{ $t('reportSelector.instructions[3]') }}
                  <a :href="getReportURL()" class="metric-selector__report-link">
                    <span class="link-underline">{{ getReportURL() }}</span>
                  </a>
                </li>
              </ul>
            </v-col>
          </v-row>
          <v-divider />
          <v-row>
            <v-col
              v-for="category in categories"
              :key="category.originalName"
              sm="6"
              md="4"
              cols="12"
            >
              <v-list>
                <v-list-item
                  :active="fullyVisibleCategories.includes(category.originalName)"
                  class="metric-selector__category"
                  :class="partiallyVisibleCategories.includes(category.originalName) ? 'partially-active' : ''"
                  :prepend-icon="fullyVisibleCategories.includes(category.originalName) ? mdiEye : mdiEyeOff"
                  @click.prevent="toggleCategory(category)"
                >
                  <v-list-item-title class="text-h6">
                    {{ category.name }}
                  </v-list-item-title>
                </v-list-item>
                <v-list>
                  <v-list-item
                    v-for="metric in category.metrics"
                    :key="metric.metric"
                    :active="metricIsVisible(metric)"
                    :value="metricIsVisible(metric)"
                    class="metric-selector__metric"
                    :prepend-icon="metricIsVisible(metric) ? mdiEye : mdiEyeOff"
                    @click.prevent="toggleMetric(metric)"
                  >
                    <v-list-item-title>{{ metric.name }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-list>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mdiClose, mdiEye, mdiEyeOff } from "@mdi/js";
import config from "../../modules/config";
import reportCategoriesFromRouteMixin
  from '@/js/components/mixins/reportCategoriesFromRouteMixin.js';
import { store } from '@/js/stores/compass-store.js';
import handleLinksMixin from '@/js/components/mixins/handleLinksMixin.js';

export default {
  name: "ReportSelector",
  mixins: [reportCategoriesFromRouteMixin, handleLinksMixin],
  inject: ['geography', 'metricValues', 'countyAverages', "reportTitle",'categoryNames'],
  data: () => ({
    dialog: false,
    mdiClose,
    mdiEye,
    mdiEyeOff,
    store,
  }),
  computed: {
    categories() {
      return this.categoryNames
        .map(categoryName => ({
          name: this.$t(`strings.metricCategories['${categoryName}']`),
          originalName: categoryName,
          metrics: Object.values(this.allMetrics)
            .filter(m => m.category === categoryName && ((this.metricValues[categoryName] && m.metric in this.metricValues[categoryName]) || (this.countyAverages[categoryName] && m.metric in this.countyAverages[categoryName])))
            .map(m => ({
              ...m,
              name: this.$i18n.locale === "es" ? m.title_es : m.title,
            }))
            .sort(this.localizedSortByName),
        }))
        .sort(this.localizedSortByName);
    },
  },
  methods: {
    toggleCategory(category) {
      this.$router.replace(this.getToggleCategoryRoute(this.$route, category.originalName));
    },
    toggleMetric(metric) {
      this.$router.replace(this.getToggleMetricRoute(this.$route, metric));
    },
    getReportURL() {
      return (
        config.siteConfig.qoldashboardURL.slice(0, -1) + this.$route.fullPath
      );
    },
  },
};
</script>

<style scoped lang="scss">
a {
  cursor: pointer;
}
.metric-selector__report-link {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.metric-selector__metric,
.metric-selector__category {
  background-color: var(--v-background-base);
}
.metric-selector__metric {
  padding-left: 30px;
}
.metric-selector .v-list {
  padding: 0;
}
.metric-selector .title {
  margin: 0;
}
.metric-selector .v-list-item--active {
  background-color: var(--v-primary-base);
  color: white;
  .v-icon {
    color: var(--v-background-base);
  }
}
.metric-selector .metric-selector__category.partially-active {
  background-color: #02a7da; // Lighter version of primary color
}
.metric-selector .metric-selector__category.v-list-item--active {
  background-color: #01495f; // Darker version of primary color
}
</style>
