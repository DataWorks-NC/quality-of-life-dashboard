<template>
  <v-theme-provider theme="dark">
    <div class="jump-nav-bar v-theme--dark">
      <v-tabs v-model="activeTab" bg-color="primary" show-arrows grow>
        <!--  TODO: Restore scroll-to behavior, was  v-scroll-to="{ el: summaryId, offset: -150, cancelable: false }"       -->
        <v-tab tag="button" depressed>
          {{ $t('strings.metricCategories.Summary') }}
        </v-tab>
        <!--  TODO: Restore scroll-to behavior, was             v-scroll-to="{ el: `#${formatAnchor(category.name)}`, offset: -60, cancelable: false }"     -->
        <v-tab
          v-for="category in categories"
          :key="formatAnchor(category.name)"
          tag="button"
          depressed
        >
          {{ category.name }}
        </v-tab>
      </v-tabs>
    </div>
  </v-theme-provider>
</template>

<script>
import reportCategoriesFromRouteMixin
  from '@/js/components/mixins/reportCategoriesFromRouteMixin.js';

import { reportStore } from '@/js/stores/report-store.js';

export default {
  name: "ReportJumpNav",
  mixins: [reportCategoriesFromRouteMixin],
  inject: ['geography'],
  data() { return {
    reportStore,
  };
  },
  computed: {
    activeTab: {
      get() {
        if (!this.reportStore.activeCategory) {
          return 0;
        }
        if (this.reportStore.activeCategory === 'Summary') {
          return 0;
        }

        for (let i = 0; i < this.categories.length; i += 1) {
          if (this.reportStore.activeCategory === this.categories[i].name) {
            return i + 1;
          }
        }
        return null;
      },
      set(i) {
        const scrollIntoViewOptions = {
          behavior: 'smooth',
        };

        this.reportStore.isScrolling = true;

        if (i === 0) {
          this.reportStore.activeCategory = 'Summary';
          document.getElementById('summary-container').scrollIntoView(scrollIntoViewOptions);
        } else {
          const categoryName = this.categories[i - 1].name;
          this.reportStore.activeCategory = categoryName;
          document.getElementById(`${this.formatAnchor(categoryName)}-container`).scrollIntoView(scrollIntoViewOptions);
        }

        setTimeout(() => this.reportStore.isScrolling = false, 500);
      },
    },
    categories() {
      return this.visibleCategories
        .map(categoryName => ({
          name: this.$t(`strings.metricCategories['${categoryName}']`),
        }))
        .sort(this.localizedSortByName);
    },
    summaryId() {
      return `#${this.$t('strings.metricCategories.Summary').toLowerCase()}`;
    },
  },
  methods: {
    formatAnchor(category) {
      return category.toLowerCase().replace(/\s/g, "-");
    },
  },
};
</script>

<style lang="scss" scoped>
.jump-nav-bar {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
