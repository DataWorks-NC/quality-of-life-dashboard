<template lang="html">
  <div class="mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-color--white category-tabs no-print">
    <div class="mdl-tabs mdl-js-tabs">
      <div class="mdl-tabs__tab-bar mdl-typography--text--center">
        <a
          v-for="category in categories"
          :class="['mdl-tabs__tab', category.name === categoryShown ? 'is-active' : '']"
          :key="category.id"
          @click="changeFilter(category.name)"
        >{{ $t(`strings.metricCategories['${category.name}']`) }}</a>
      </div>

        <div class="mdl-tabs__panel is-active" :id="`${categoryShown}-panel`" :key="categoryShown">
          <button v-for="m in metricsByCategory[categoryShown]" :key="m.metric" :class="['mdl-chip', m.metric === metricId ? 'is-active' : '']" type="button" @click="changeMetric(m.metric)">
            <span class="mdl-chip__text">{{ $i18n.locale === 'es' ? m.title_es : m.title }}</span>
          </button>
        </div>

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
  computed: mapState({
    metric: 'metric',
    metricId: 'metricId',
    categories() {
      return config.categories.map(c => ({ id: c.replace(/\s+/g, ''), name: c }));
    },
    categoryShown() {
      return this.filterVal || this.metric.config.category;
    }
  }),

  methods: {
    changeFilter(filter) {
      this.filterVal = filter;
    },
    changeMetric(metric) {
      const newParams = Object.assign(this.$route.params, { metric });
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
  .mdl-tabs__panel {
    padding: 10px;
  }
  .mdl-tabs__tab-bar {
    justify-content: left;
    height: auto;
    padding: 10px 5px 0 5px;
  }
  .mdl-tabs.is-upgraded .mdl-tabs__tab.is-active:after {
    background: #00688B;
    height: 4px;
  }
  .mdl-chip {
    margin: 2px;
    cursor: pointer;
  }
  .mdl-chip.is-active {
    background: #00688B;
    color: white;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
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
