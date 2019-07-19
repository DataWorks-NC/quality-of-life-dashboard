<template>
  <div v-if="!collapsed" :class="collapsed ? 'collapsed' : ''" class="page page-category metric-selector">
    <div class="row metric-selector__body">
      <div class="col-xs-11">
        <p>
          {{ $t('reportSelector.instructionsIntro') }}
          <ul>
            <li>{{ $t('reportSelector.instructions[0]') }}</li>
            <li>{{ $t('reportSelector.instructions[1]') }}</li>
            <i18n path="reportSelector.instructions[2]" tag="li">
              <router-link place="goBack" :to="$store.state.lastCompassRoute ? $store.state.lastCompassRoute : { name: 'homepage', params: $route.params, query: { selected: $route.query.selected } }">
                {{ $t('reportSelector.goBack') }}
              </router-link>
            </i18n>
            <li>{{ $t('reportSelector.instructions[3]') }}<a :href="getReportURL()" class="metric-selector__report-link">{{ getReportURL() }}</a></li>
          </ul>
        </p>
      </div>
      <div class="col-xs-1">
        <a @click.prevent="$emit('collapse-selector')">{{ $t('strings.close') | capitalize }}</a>
      </div>
    </div>
    <div class="row metric-selector__body">
      <div v-for="category in hiddenCategories" :key="category.originalName" class="col-xs-12 col-sm-6 col-md-4">
        <div class="list-group">
          <a class="list-group-item list-group-item-action" @click.prevent="toggleCategory(category.originalName, true)">{{ category.name }}<p class="metric-selector__tip">{{ $t('reportSelector.categoryTip') }}</p></a>
        </div>
      </div>
    </div>
    <div class="row metric-selector__body">
      <div class="col-xs-12">
        <h4>{{ $t('reportSelector.metricsShown') }}</h4>
      </div>
      <div v-for="category in visibleCategories" :key="category.originalName" class="col-xs-12 col-sm-6 col-md-4">
        <div class="list-group">
          <a class="active list-group-item list-group-item-action" @click.prevent="toggleCategory(category.originalName, false)">{{ category.name }}</a>
          <div class="list-group metric-selector__sub-metrics">
            <a v-for="metric in category.metrics" :key="metric.metric" :class="metric.visible ? 'active' : ''" class="list-group-item list-group-item-action metric-selector__sub-metric" @click.prevent="toggleMetric(metric)">{{ metric.name }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import config from '../../modules/config';


export default {
  name: 'ReportSelector',
  props: {
    collapsed: Boolean,
  },
  computed: {
    ...mapGetters([
      'reportTitle',
    ]),
    ...mapState({
      categoryNames: state => state.report.categoryNames,
      metrics: state => state.report.metrics,
    }),
    hiddenCategories() {
      return this.$store.getters.hiddenCategories.map(
        categoryName => ({
          name: this.$t(`strings.metricCategories['${categoryName}']`),
          originalName: categoryName,
        }
        ),
      ).sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
    },
    visibleCategories() {
      return this.$store.getters.visibleCategories.map(
        categoryName => ({
          name: this.$t(`strings.metricCategories['${categoryName}']`),
          originalName: categoryName,
          metrics: Object.values(this.$store.state.report.metrics)
            .filter(m => m.category === categoryName && m.visible)
            .map(m => ({ ...m, name: (this.$i18n.locale === 'es' ? m.title_es : m.title) }))
            .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name)),
        }
        ),
      ).sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
    },
  },
  methods: {
    toggleCategory(categoryName, visibility) {
      this.$store.commit('toggleCategory', { categoryName, visibility });
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

<style scoped>
  a {
    cursor: pointer;
  }
  .metric-selector__report-link {
    word-wrap: break-word;
  }

  .collapsed {
    background: rgb(204, 204, 204);
  }
  .metric-selector__sub-metric {
    padding: 5px 15px;
  }
  .metric-selector__sub-metric.active {
    background-color: #669ECC;
    border: #669ECC;
  }
  .metric-selector__tip {
    color: #888;
  }
</style>
