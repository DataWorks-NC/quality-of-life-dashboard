<template>
  <div v-if="validMetrics.length">
    <v-card>
      <v-container :id="`${formatAnchor(category.name)}-container`" :data-category="category.name">
        <v-row>
          <v-col cols="12">
            <h2 :id="formatAnchor(category.name)">
              {{ category.name }}
            </h2>
          </v-col>
        </v-row>
        <template v-if="countyAverages || metricValues">
          <template v-for="m in validMetrics" :key="m.metric">
            <v-row>
              <v-col cols="12">
                <ReportMetricCard
                  :metric="m"
                  :metric-values="metricValues ? metricValues[m.metric] : null"
                  :county-averages="countyAverages ? countyAverages[m.metric] : null"
                />
              </v-col>
            </v-row>
            <div class="spacer" />
          </template>
        </template>
      </v-container>
    </v-card>
    <div class="spacer" />
  </div>
</template>

<script>
import ReportMetricCard from "./ReportMetricCard.vue";
export default {
  name: "ReportCategorySection",
  components: {
    ReportMetricCard,
  },
  inject: ['intersectionObserver'],
  props: {
    category: {
      type: Object,
      required: true,
    },
    metricValues: {
      type: Object,
      required: false,
      default: () => {},
    },
    countyAverages: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      isObserved: false,
    };
  },
  computed: {
    validMetrics() {
      return this.category.metrics.filter(m => ((this.metricValues && (m.metric in this.metricValues)) || (this.countyAverages && (m.metric in this.countyAverages))));
    },
  },
  mounted() {
    if (this.intersectionObserver) {
      this.isObserved = true;
      this.intersectionObserver.observe(
        document.getElementById(`${this.formatAnchor(this.category.name)}-container`));
    }
  },
  updated() {
    if (this.intersectionObserver && !this.isObserved) {
      this.isObserved = true;
      this.intersectionObserver.observe(
        document.getElementById(`${this.formatAnchor(this.category.name)}-container`));
    }
  },
  methods: {
    formatAnchor(category) {
      return category.toLowerCase().replace(/\s/g, "-");
    },
  },
};
</script>

<style lang="scss" scoped>
h2 {
  font-size: 1.5em;
  font-weight: 700;
  position: relative;
  margin-top: 0.75em;
  margin-bottom: 0.75em;
  text-transform: uppercase;

  &::after {
    content: "";
    width: 150px;
    height: 3px;
    background-color: rgb(var(--v-theme-primary));
    position: absolute;
    bottom: -10px;
    left: 0;
  }
}
</style>
