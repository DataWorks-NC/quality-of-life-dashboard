<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition" class="metric-selector">
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on">
          {{ $t('reportSelector.customize') }}
        </v-btn>
      </template>
      <v-card class="metric-selector">
        <v-toolbar dark>
          <v-btn icon @click="dialog = false">
            <v-icon>{{ mdiClose }}</v-icon>
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
                <i18n path="reportSelector.instructions[2]" tag="li">
                  <router-link place="goBack" :to="$store.state.lastCompassRoute ? $store.state.lastCompassRoute : { name: 'homepage', params: $route.params, query: { selected: $route.query.selected } }">
                    {{ $t('reportSelector.goBack') }}
                  </router-link>
                </i18n>
                <li>{{ $t('reportSelector.instructions[3]') }} <a :href="getReportURL()" class="metric-selector__report-link">{{ getReportURL() }}</a></li>
              </ul>
            </v-col>
          </v-row>
          <v-divider />
          <v-row>
            <v-col v-for="category in categories" :key="category.originalName" xs="12" sm="6" md="4">
              <v-list>
                <v-list-item :input-value="category.metrics.every(m=>m.visible)" class="metric-selector__category" :class="category.metrics.some(m => m.visible) && 'partially-active'" @click.prevent="toggleCategory(category)">
                  <v-list-item-icon><v-icon>{{ category.metrics.every(m=>m.visible) ? mdiEye : mdiEyeOff }}</v-icon></v-list-item-icon><v-list-item-title class="title">
                    {{ category.name }}
                  </v-list-item-title>
                </v-list-item>
                <v-list>
                  <v-list-item v-for="metric in category.metrics" :key="metric.metric" :input-value="metric.visible" :value="metric.visible" class="metric-selector__metric" icon @click.prevent="toggleMetric(metric)">
                    <v-list-item-icon>
                      <v-icon size="16px">
                        {{ metric.visible ? mdiEye : mdiEyeOff }}
                      </v-icon>
                    </v-list-item-icon><v-list-item-title>{{ metric.name }}</v-list-item-title>
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
import { mapGetters, mapState } from 'vuex';
import config from '../../modules/config';


export default {
  name: 'ReportSelector',
  data: () => ({
    dialog: false,
    mdiClose,
    mdiEye,
    mdiEyeOff,
  }),
  computed: {
    ...mapGetters([
      'reportTitle',
      'visibleCategories',
    ]),
    ...mapState({
      categoryNames: state => state.report.categoryNames,
      metrics: state => state.report.metrics,
    }),

    categories() {
      return this.categoryNames.map(
        categoryName => ({
          name: this.$t(`strings.metricCategories['${categoryName}']`),
          originalName: categoryName,
          visible: this.visibleCategories.indexOf(categoryName) !== -1,
          metrics: Object.values(this.$store.state.report.metrics)
            .filter(m => m.category === categoryName)
            .map(m => ({ ...m, name: (this.$i18n.locale === 'es' ? m.title_es : m.title) }))
            .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name)),
        }
        ),
      ).sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
    },
  },
  methods: {
    toggleCategory(category) {
      this.$store.commit('toggleCategory', { categoryName: category.originalName, visibility: !category.visible });
      this.updateRoute();
    },
    toggleMetric(metric) {
      this.$store.commit('toggleMetric', { metricId: `m${metric.metric}`, visibility: !metric.visible });
      this.updateRoute();
    },
    updateRoute() {
      this.$router.push({ params: this.$route.params, query: { ...this.$route.query, visibleCategories: this.$store.getters.totallyVisibleCategories, visibleMetrics: this.$store.getters.visibleMetricsInMixedCategories } });
    },
    getReportURL() {
      return config.siteConfig.qoldashboardURL.slice(0, -1) + this.$route.fullPath;
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

  .metric-selector__metric, .metric-selector__category {
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
    background-color: var(--v-primary-lighten2);
  }

  .metric-selector .metric-selector__category.v-list-item--active {
    background-color: var(--v-primary-darken2);
  }
</style>
