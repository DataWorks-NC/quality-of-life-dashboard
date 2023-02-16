<template>
  <div class="search-results v-btn--size-default">
    <template v-if="!mobile">
      <v-btn v-for="m in (expanded ? matchingMetrics : matchingMetrics.slice(0, maxMetricsToShow))" :key="m.id" exact rounded variant="flat" :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }">
        {{ m.title }}
      </v-btn>
      <v-btn v-if="matchingMetrics.length > maxMetricsToShow" :prepend-icon="expanded ? mdiMinusCircle : mdiPlusCircle" rounded variant="flat" @click.prevent="toggleExpand()">
        {{ expanded ? $t('search.less') : $t('search.all') }}
      </v-btn>
    </template>
    <template v-else>
      <v-list-item v-for="m in matchingMetrics" :key="m.metric" :value="m.metric" :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }">
        <v-list-item-title> {{ m.name }} </v-list-item-title>
      </v-list-item>
    </template>
    <span v-if="searchText.trim().length === 0" class="search-results--text-annotation" tabindex="-1">
      {{ $t('search.startTyping') }}
    </span>
    <i18n-t v-else-if="matchingMetrics.length === 0" keypath="search.noResults" tag="span" class="search-results--text-annotation" tabindex="-1">
      <ExternalLink :href="feedbackUrl">
        {{ $t('search.getInTouch') }}
      </ExternalLink>
    </i18n-t>
  </div>
</template>

<script>
import config from '../helpers/config';
import ExternalLink from '@/js/components/ExternalLink.vue';
import { mdiPlusCircle, mdiMinusCircle } from "@mdi/js";

// TODO: Add transitions.

export default {
  name: 'MetricSearchResults',
  components: {ExternalLink},
  props: {
    searchText: {
      type: String,
      default: '',
    },
    mobile: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      feedbackUrl: config.siteConfig.feedbackUrl,
      expanded: false,
      mdiMinusCircle,
      mdiPlusCircle,
    }
  },
  computed: {
    categories() {
      return config.categories.map(c => ({ id: c.replace(/\s+/g, ''), name: this.$t(`strings.metricCategories['${c}']`), originalName: c }))
      .sort(this.localizedSortByName);
    },
    matchingMetrics() {
      const trimmedSearch = this.searchText.toUpperCase().trim();

      if (trimmedSearch === '') {
        return [];
      }
      const metrics = Object.values(config.dataConfig).map(m => ({ ...m, name: this.$i18n.locale === 'es' ? m.title_es : m.title})).sort((a, b) => this.localizedSortByName(a.name, b.name));
      return [...metrics.filter(m => m.name.toUpperCase().startsWith(trimmedSearch)), ...metrics.filter(m => m.name.toUpperCase().includes(trimmedSearch) && !m.name.toUpperCase().startsWith(trimmedSearch))]
    },
    maxMetricsToShow() {
     return this.searchText.length > 3 ? 10 : 5;
    }
  },
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },
  }
};
</script>

<style scoped>
div.search-results {
  min-height: 40px;
}
.search-results--text-annotation {
  height: calc(var(--v-btn-height));
  line-height: calc(var(--v-btn-height));
  margin: 2px;
  padding: 0 0.5em;
}
</style>
