<template>
  <div>
    <ReportCategorySection v-for="c in categories" :key="c.name" :category="c" :metric-values="metricValues[c.originalName]" :county-averages="countyAverages[c.originalName]" />
  </div>
</template>

<script>
import reportCategoriesFromRouteMixin
  from '@/js/components/mixins/reportCategoriesFromRouteMixin.js';
import ReportCategorySection from './ReportCategorySection.vue';

export default {
  name: 'ReportBody',
  components: {
    ReportCategorySection,
  },
  mixins: [reportCategoriesFromRouteMixin],
  inject: ['metricValues', 'countyAverages', 'geography'],
  computed: {
    categories() {
      return this.visibleCategories
      .map(
        categoryName => ({
          name: this.$t(`strings.metricCategories['${categoryName}']`),
          originalName: categoryName,
          metrics: Object.values(this.allMetrics)
            .filter(m => m.category === categoryName && this.metricIsVisible(m))
            .map(m => ({ ...m, name: (this.$i18n.locale === 'es' ? m.title_es : m.title) }))
            .sort(this.localizedSortByName),
        }
        ),
      );
    },
  },
};
</script>
