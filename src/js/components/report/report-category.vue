<template>
  <div v-if="validMetrics.length">
    <v-card>
      <!--      TODO: FIX visibility observer. Was: v-observe-visibility="visibilityOptions" -->
      <v-container :id="`${formatAnchor(category.name)}-container`">
        <v-row>
          <v-col cols="12">
            <h2 :id="formatAnchor(category.name)">
              {{ category.name }}
            </h2>
          </v-col>
        </v-row>
        <div v-for="m in validMetrics" :key="m.metric">
          <v-row>
            <v-col cols="12">
              <ReportMetric
                :key="m.metric"
                :metric="m"
                :metric-values="metricValues && m.metric in metricValues ? metricValues[m.metric] : null"
                :county-averages="countyAverages && m.metric in countyAverages ? countyAverages[m.metric] : null"
                :visible="m.visible"
              />
            </v-col>
          </v-row>
          <v-spacer />
        </div>
      </v-container>
    </v-card>
    <v-spacer />
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { reportStore } from '@/js/stores/report.js';
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
      return this.category.metrics.filter(m => ((this.metricValues && m.metric in this.metricValues) || (this.countyAverages && m.metric in this.countyAverages)));
    },
  },
  methods: {
    ...mapActions(reportStore, ["setActiveCategory"]),
    formatAnchor(category) {
      return category.toLowerCase().replace(/\s/g, "-");
    },
    categoryVisible(isVisible, entry) {
      if (!isVisible) {
        return;
      }
      this.setActiveCategory(entry.target.id);
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
