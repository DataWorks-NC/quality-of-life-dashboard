import config from '@/js/helpers/config.js';

import { union, omit, difference } from 'lodash-es';

import { deleteFrom, paramToArray } from '../../helpers/miscHelpers.js';

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
      return paramToArray(this.$route.query, 'visibleMetrics');
    },
    fullyVisibleCategories() {
      if ((!this.$route.query.visibleCategories)) {
        if (this.visibleMetrics.length === 0) {
          return Array.from(new Set(this.allMetrics.map(m => (m.category))));
        }
        return [];
      }
      return paramToArray(this.$route.query, 'visibleCategories');
    },
    partiallyVisibleCategories() {
      const partiallyVisibleCategories = new Set();
      this.visibleMetrics.forEach(
        metricId => {
          const key = `m${metricId}`;
          if (key in config.dataConfig) {
            partiallyVisibleCategories.add(config.dataConfig[key].category);
          }
        });
      return Array.from(partiallyVisibleCategories).sort();
    },
    visibleCategories() {
      return union(this.fullyVisibleCategories, this.partiallyVisibleCategories).sort(this.localizedSortByName);
    },
  },
  methods: {
    metricIsVisible(metric) {
      return this.visibleMetrics.includes(metric.metric) || this.fullyVisibleCategories.includes(metric.category);
    },
    getToggleCategoryRoute(categoryName) {
      // If this category is already in the visible categories query, just remove it!
      if (this.fullyVisibleCategories.includes(categoryName)) {
        return {
          name: 'report',
          params: this.$route.params,
          query: {
            ...this.$route.query,
            visibleCategories: deleteFrom(this.fullyVisibleCategories, categoryName)
          }
        };
      }

      // If this category has some metrics showing, clear out all those metrics from visibleMetrics query.
      else if (this.visibleMetrics.some(metricId => config.dataConfig[`m${metricId}`].category === categoryName)) {
        return {
          name: 'report',
          params: this.$route.params,
          query: {
            ...this.$route.query,
            visibleMetrics: difference(this.visibleMetrics, this.allMetrics.
              filter(m => m.category === categoryName).
              map(m => m.metric))
          }
        };
      }

      // Otherwise this is hidden and should be shown. So add it to visibleCategories.
      // Or, if this is the last category hidden, then clear out the parameter entirely.
      if (this.visibleCategories.length === this.allCategories.length - 1) {
        return {
          name: 'report',
          params: this.$route.params,
          query: omit(this.$route.query, 'visibleCategories')
        };
      }

      return {
        name: 'report',
        params: this.$route.params,
        query: {
          ...this.$route.query,
          visibleCategories: [...this.fullyVisibleCategories, categoryName]
        }
      };
    },
    getToggleMetricRoute(metricName) {
      const key = `m${metricName}`;
      if (!(key in config.dataConfig)) {
        console.error(`${key} not found in data Config!`);
        return;
      }
      const category = config.dataConfig[`m${metricName}`].category;
      // If metric is in the visibleMetrics array, then remove it.
      if (this.visibleMetrics.includes(metricName)) {
        return {
          name: 'report',
          params: this.$route.params,
          query: { ...this.$route.query, visibleMetrics: deleteFrom(this.visibleMetrics, metricName) }}
      }

      // If metric is in a category that is fully visible, then we need to switch the category to partially visible.
      if (this.fullyVisibleCategories.includes(category)) {
        return {
          name: 'report',
          params: this.$route.params,
          query: {
            ...this.$route.query,
            visibleCategories: deleteFrom(this.fullyVisibleCategories, category),
            visibleMetrics: union(this.visibleMetrics, this.allMetrics.filter(m => m.category === category && m.metric !== metricName).map(m=> m.metric)) }};
      }

      // If metric is currently hidden, then we first need to check if it is the last metric in a category that would otherwise be fully visible.
      if (this.allMetrics.filter(m => m.category === category && !this.visibleMetrics.includes(m.metric)).length === 1) {
        const newVisibleCategories = [...this.fullyVisibleCategories, category];
        return {
          name: 'report',
          params: this.$route.params, query: { ...this.$route.query,
            visibleCategories: newVisibleCategories,
            visibleMetrics: this.allMetrics.filter(m => this.visibleMetrics.includes(m.metric) && !newVisibleCategories.includes(m.category)).map(m=> m.metric),
          }}
      }

      // With all that done, we can just show it.
      return {
        name: 'report',
        params: this.$route.params, query: { ...this.$route.query, visibleMetrics: [...this.visibleMetrics, metricName]}}
    }
  }
}
