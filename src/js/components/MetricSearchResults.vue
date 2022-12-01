<template>
  <div class="search-results">
    <v-btn v-for="m in matchingMetrics.slice(0, maxMetricsToShow)" :key="m.id" exact rounded variant="flat" :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }">
      {{ m.title }}
    </v-btn>
    <span v-if="matchingMetrics.length > maxMetricsToShow">
      ...
    </span>
    <v-btn v-if="matchingMetrics.length === 0" rounded variant="flat" disabled>
      Start typing to see search results
    </v-btn>
  </div>
</template>

<script>
import config from '../modules/config';

export default {
  name: 'MetricSearchResults',
  props: {
    searchText: {
      type: String,
      default: '',
    }
  },
  computed: {
    categories() {
      return config.categories.map(c => ({ id: c.replace(/\s+/g, ''), name: this.$t(`strings.metricCategories['${c}']`), originalName: c }))
      .sort(this.localizedSortByName);
    },
    matchingMetrics() {
      if (this.searchText.trim() === '') {
        return [];
      }
      return Object.values(config.dataConfig).map(m => ({ ...m, name: this.$i18n.locale === 'es' ? m.title_es : m.title})).filter(m => m.name.toUpperCase().includes(this.searchText.toUpperCase().trim()));
    },
    maxMetricsToShow() {
     return this.searchText.length > 3 ? 10 : 5;
    }
  }
};
</script>

<style scoped>
div.search-results {
  min-height: 40px;
}
</style>
