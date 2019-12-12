<template>
  <v-row class="jump-nav-bar">
    <v-col xs="12">
      <div>
        <v-tabs v-model="activeTab" background-color="primary" show-arrows grow dark>
          <v-tab v-scroll-to="{ el: summaryId, offset: -150, cancelable: false }" tag="button" rounded depressed>
            {{ $t('strings.metricCategories.Summary') }}
          </v-tab>
          <v-tab
            v-for="category in categories"
            :key="formatAnchor(category.name)"
            v-scroll-to="{ el: `#${formatAnchor(category.name)}`, offset: -60, cancelable: false }"
            tag="button"
            rounded
            depressed
          >
            {{ category.name }}
          </v-tab>
        </v-tabs>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ReportJumpNav",
  computed: {
    ...mapGetters(["visibleCategories", "activeCategory"]),
    activeTab: {
      get() {
        if (this.activeCategory === this.$t('strings.metricCategories.Summary')) {
          return 0;
        }
        const cat = this.activeCategory.split("-").slice(0, -1).join(" ");
        for (let i = 0; i < this.categories.length; i += 1) {
          const item = this.categories[i].name.toLowerCase();
          if (cat === item) {
            return i + 1;
          }
        }
        return null;
      },
      set() {
        // Null but needed so we can use v-model without errors with activeTab. Could posslby move the
        // v-scroll-to logic into this setter too at some point.
      },
    },
    categories() {
      return this.visibleCategories
        .map(categoryName => ({
          name: this.$t(`strings.metricCategories['${categoryName}']`),
        }))
        .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
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

<style lang="scss">
.jump-nav-bar {
  position: sticky;
  top: 0;
  z-index: 10;

  .col {
    padding-top: 0;
  }
}

.v-tab a {
  color: white;
  text-decoration: none;
}
</style>
