import config from '@/js/modules/config.js';

import { union, omit, difference, isArray } from 'lodash-es';

function deleteFrom(ary, item) {
  return ary.filter(i => i !== item);
}

export default {
  // Note: Must inject the geography param!
  computed: {
    allMetrics() {
      return Object.values(config.dataConfig).
        filter(m => m.geographies.includes(this.geography.id));
    },
    allCategories() {
      return Array.from(new Set(this.allMetrics.map(m => m.category)));
    },
    visibleMetrics() {
      if (!this.$route.query.visibleMetrics) {
        return [];
      }
      if (isArray(this.$route.query.visibleMetrics)) {
        return this.$route.query.visibleMetrics;
      }
      return [this.$route.query.visibleMetrics];
    },
    fullyVisibleCategories() {
      if (!this.$route.query.visibleCategories) {
        return Array.from(new Set(this.allMetrics.map(m => (m.category))));
      }
      if (isArray(this.$route.query.visibleCategories)) {
        return this.$route.query.visibleCategories;
      }
      return [this.$route.query.visibleCategories];
    },
    partiallyVisibleCategories() {
      const partiallyVisibleCategories = new Set();
      this.visibleMetrics.forEach(
        metricId => partiallyVisibleCategories.add(config.dataConfig[`m${metricId}`].category))
      return Array.from(partiallyVisibleCategories);
    },
    visibleCategories() {
      return union(this.fullyVisibleCategories, this.partiallyVisibleCategories).sort(this.localizedSortByName);
    },
  },
  methods: {
    metricIsVisible(metric) {
      return this.visibleMetrics.includes(metric.metric) || this.fullyVisibleCategories.includes(metric.category);
    },
    getToggleCategoryRoute(currentRoute, categoryName) {
      // If this category is already in the visible categories query, just remove it!
      if (this.fullyVisibleCategories.includes(categoryName)) {
        return {
          name: 'report',
          params: currentRoute.params,
          query: {
            ...currentRoute.query,
            visibleCategories: deleteFrom(this.fullyVisibleCategories, categoryName)
          }
        };
      }

      // If it has some metrics showing, clear out all those metrics from visibleMetrics query.
      else if (Object.values(config.dataConfig).some(m => this.visibleMetrics.includes(m.metric))) {
        return {
          name: 'report',
          params: currentRoute.params,
          query: {
            ...currentRoute.query,
            visibleMetrics: difference(this.visibleMetrics, this.allMetrics.
              filter(m => m.category = categoryName).
              map(m => m.metric))
          }
        };
      }

      // Otherwise this is hidden and should be shown. So add it to visibleCategories.
      // Or, if this is the last category hidden, then clear out the parameter entirely.
      if (this.visibleCategories.length === this.allCategories.length - 1) {
        return {
          name: 'report',
          params: currentRoute.params,
          query: omit(currentRoute.query, 'visibleCategories')
        };
      }

      return {
        name: 'report',
        params: currentRoute.params,
        query: {
          ...currentRoute.query,
          visibleCategories: [...this.visibleCategories, categoryName]
        }
      };
    },
    getToggleMetricRoute(currentRoute, { metric, category }) {
      // If metric is in the visibleMetrics array, then remove it.
      if (this.visibleMetrics.includes(metric)) {
        return {
          name: 'report',
          params: currentRoute.params,
          query: { ...currentRoute.query, visibleMetrics: deleteFrom(this.visibleMetrics, metric) }}
      }

      // If metric is in a category that is fully visible, then we need to switch the category to partially visible.
      if (this.fullyVisibleCategories.includes(category)) {
        return {
          name: 'report',
          params: currentRoute.params,
          query: {
            ...currentRoute.query,
            visibleCategories: deleteFrom(this.fullyVisibleCategories, category),
            visibleMetrics: union(this.visibleMetrics, this.allMetrics.filter(m => m.category === category && m.metric !== metric).map(m=> m.metric)) }};
      }

      // If metric is currently hidden, then we first need to check if it is the last metric in a category that would otherwise be fully visible.
      if (this.allMetrics.filter(m => m.category === category && !this.visibleMetrics.includes(m.metric)).length === 1) {
        const newVisibleCategories = [...this.fullyVisibleCategories, category];
        return {
          name: 'report',
          params: currentRoute.params, query: { ...currentRoute.query,
            visibleCategories: newVisibleCategories,
            visibleMetrics: this.allMetrics.filter(m => this.visibleMetrics.includes(m.metric) && !newVisibleCategories.includes(m.category)).map(m=> m.metric),
          }}
      }

      // With all that done, we can just show it.
      return {
        name: 'report',
        params: currentRoute.params, query: { ...currentRoute.query, visibleMetrics: [...this.visibleMetrics, metric]}}
    }
  }
}
