<template>
  <div>
    <ReportCategory v-for="c in categories" :key="c.name" :category="c" :metric-values="metricValues[c.originalName]" :county-averages="countyAverages[c.originalName]" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ReportCategory from './report-category';

export default {
  name: 'ReportBody',
  components: {
    ReportCategory,
  },
  computed: {
    ...mapState({
      metricValues: state => state.report.metricValues,
      countyAverages: state => state.report.countyAverages,
    }),
    categories() {
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
};
</script>

<style scoped>

</style>
