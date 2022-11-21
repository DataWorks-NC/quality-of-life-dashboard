<template>
  <div v-if="validMetrics.length">
    <v-card>
      <!--      TODO: FIX visibility observer. Was: v-observe-visibility="visibilityOptions" -->
      <v-layout :id="`${formatAnchor(category.name)}-container`">
        <v-row>
          <v-col cols="12">
            <h2 :id="formatAnchor(category.name)">
              {{ category.name }}
            </h2>
          </v-col>
        </v-row>
        <div v-if="countyAverages && metricValues">
          <v-row v-for="m in validMetrics" :key="m.metric">
            <v-col cols="12">
              <ReportMetric
                :metric="m"
                :metric-values="metricValues[m.metric]"
                :county-averages="countyAverages[m.metric]"
              />
            </v-col>
          </v-row>
          <v-spacer />
        </div>
      </v-layout>
    </v-card>
    <v-spacer />
  </div>
</template>

<script>
import ReportMetric from "./report-metric.vue";
export default {
  name: "ReportCategory",
  components: {
    ReportMetric,
  },
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
      visibilityOptions: {
        callback: this.categoryVisible,
        throttle: 300,
        intersection: {
          threshold: 0.1,
        },
      },
    };
  },
  computed: {
    validMetrics() {
      return this.category.metrics.filter(m => ((this.metricValues && (m.metric in this.metricValues)) || (this.countyAverages && (m.metric in this.countyAverages))));
    },
  },
  methods: {
    formatAnchor(category) {
      return category.toLowerCase().replace(/\s/g, "-");
    },
    // categoryVisible(isVisible, entry) {
    //   if (!isVisible) {
    //     return;
    //   }
    //   // TODO: Fix this.
    //   // this.setActiveCategory(entry.target.id);
    // },
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
