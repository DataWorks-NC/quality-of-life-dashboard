<template>
  <v-row class="jump-nav-bar">
    <v-col xs="12">
      <div>
        <v-tabs v-model="activeTab" background-color="primary" show-arrows dark>
          <v-tab v-scroll-to="{ el: '#summary', offset: -150 }" exact rounded depressed>
            Summary
          </v-tab>
          <v-tab
            v-for="category in visibleCategories"
            :key="formatAnchor(category)"
            v-scroll-to="{ el: `#${formatAnchor(category)}`, offset: -60 }"
            rounded
            depressed
          >
            {{ category }}
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
  data() {
    return {
      activeTab: null,
    };
  },
  created() {
    this.$store.subscribe((mutation) => {
      if (mutation.type === "setActiveCategory") {
        if (this.activeCategory === 'summary') {
          this.activeTab = 0;
        } else {
          const cat = this.activeCategory
            .split("-")
            .slice(0, -1)
            .join(" ");
          for (let i = 0; i < this.visibleCategories.length; i += 1) {
            const item = this.visibleCategories[i].toLowerCase();
            if (cat === item) {
              this.activeTab = i + 1;
            }
          }
        }
      }
    });
  },
  computed: {
    ...mapGetters(["visibleCategories", "activeCategory"]),
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
