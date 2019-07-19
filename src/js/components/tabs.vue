<template lang="html">
  <div class="mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-color--white category-tabs no-print">
    <div class="mdl-tabs mdl-js-tabs">
      <div class="mdl-tabs__tab-bar mdl-typography--text--center">
        <a
          v-for="category in categories"
          :key="category.id"
          :class="['mdl-tabs__tab', category.originalName === categoryShown ? 'is-active' : '']"
          :href="`#${category.id}-panel`"
          @click="changeFilter(category.name)"
        >{{ category.name }}</a>
      </div>

      <template v-for="category in categories">
        <div :id="`${category.id}-panel`" :key="category.id" :class="['mdl-tabs__panel', category.originalName === categoryShown ? 'is-active' : '']">
          <button v-for="m in categoryMetrics(category.originalName)" :key="m.metric" :class="['mdl-chip', m.metric === metricId ? 'is-active' : '']" type="button" @click="changeMetric(m.metric)">
            <span class="mdl-chip__text">{{ m.name }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import config from '../modules/config';

export default {
  name: 'Tabs',
  data: () => ({
    filterVal: null,
    metricsByCategory: config.metricsByCategory,
  }),
  computed: {
    ...mapState({
      metric: 'metric',
      metricId: 'metricId',
    }),
    categories() {
      return config.categories.map(c => ({ id: c.replace(/\s+/g, ''), name: this.$t(`strings.metricCategories['${c}']`), originalName: c }))
        .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
    },
    categoryShown() {
      return this.filterVal || (this.metric.config && this.metric.config.category);
    },
  },
  methods: {
    // Return sorted array of metrics by category, with the names translated as needed.
    categoryMetrics(categoryName) {
      if (categoryName in config.metricsByCategory) {
        return config.metricsByCategory[categoryName]
          .map(m => ({ metric: m.metric, name: (this.$i18n.locale === 'es' ? m.title_es : m.title) }))
          .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
      }
      return [];
    },
    changeFilter(filter) {
      this.filterVal = filter;
    },
    changeMetric(metric) {
      const newParams = { ...this.$route.params, metric };
      if (!('geographyLevel' in newParams)) {
        newParams.geographyLevel = 'tract';
      }
      this.$router.push({ name: 'compass', params: newParams });
    },
  },
};
</script>

<style lang="css" scoped>
  .mdl-tabs__tab {
    padding: 0 14px;
    height: auto;
    min-height: 48px;
    line-height: inherit;
  }
  .mdl-tabs__tab:hover {
    color: #68089e;
    text-decoration: none;
  }
  .mdl-tabs__panel {
    padding: 10px;
  }
  .mdl-tabs__tab-bar {
    justify-content: left;
    height: auto;
    padding: 10px 5px 0 5px;
  }
  .mdl-tabs.is-upgraded .mdl-tabs__tab.is-active {
    color: #68089e;
  }
  .mdl-tabs.is-upgraded .mdl-tabs__tab.is-active:after {
    background: #68089e;
    height: 4px;
  }
  .mdl-chip {
    margin: 2px;
    cursor: pointer;
  }

  @media (max-width: 975px) {
    .category-tabs {
      display: none;
    }
  }
</style>

<style>
  .mdl-tabs__panel {
    display: none;
  }
</style>
