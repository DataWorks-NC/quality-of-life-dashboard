<template>
  <div
    v-if="years.length > 1"
    class="qol-chart"
  >
    <p v-if="metricConfig" class="text-h6 text-center">
      {{ $i18n.locale === 'en' ? metricConfig.title : metricConfig.title_es }}
    </p>
    <div class="legend text-center">
      <span v-if="countyValues" class="text-caption"><v-icon color="#778b91" :icon="mdiTrendingUp" /> {{ $filters.capitalize($t('strings.county')) }}</span>
      <span v-if="values" class="text-caption"><v-icon color="accent" :icon="mdiTrendingUp" /> {{ $filters.capitalize($t('strings.selected')) }}</span>
    </div>
    <div class="trendchart">
      <div :id="'ct-trendchart-' + metricConfig.metric" class="ct-trendchart chartist" />
    </div>
  </div>
</template>

<script>
import { mdiTrendingUp } from "@mdi/js";
import { LineChart, Interpolation, Svg, AutoScaleAxis } from 'chartist';

import { legendLabelNumber } from "../modules/number_format";

export default {
  name: "TrendChart",
  props: {
    years: {
      type: Array,
      required: true,
    },
    values: {
      type: Object,
      default: () => {},
    },
    countyValues: {
      type: Object,
      default: () => {},
    },
    metricConfig: {
      type: Object,
      required: true,
    },
    // Key to identify if this component needs to have MDL framework styling (used in the dashboard) or not.
    framework: {
      type: String,
      required: false,
      default: "",
    },
  },
  data: () => ({ mdiTrendingUp }),
  computed: {
    // The two "chart" computed variables filter the metric objects into arrays keyed by year, leaving null gaps where there's no data for a given year.
    countyValuesChart() {
      return this.years.map((year) => {
        if (this.countyValues && year in this.countyValues) return { x: year, y: this.countyValues[year] };
        return null;
      });
    },
    valuesChart() {
      return this.years.map((year) => {
        if (this.values && year in this.values) return { x: year, y: this.values[year] };
        return null;
      });
    },
  },
  mounted() {
    this.chart = null;
    this.renderChart();
  },
  updated() {
    this.renderChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.detach();
    }
  },
  methods: {
    renderChart() {
      // Render chart, but only if all the data is here (so render only once).
      // Filter i=>i call returns true only if the array contains at least one non-null value.
      if (this.years.length <= 1) return;
      const { metricConfig } = this;
      const len = this.years[this.years.length - 1] - this.years[0];
      const options = {
        fullWidth: true,
        height: "180px",
        showArea: false,
        low: 0,
        chartPadding: {
          right: 40,
        },
        lineSmooth: Interpolation.cardinal({
          fillHoles: true,
        }),
        axisY: {
          labelInterpolationFnc: value => legendLabelNumber(value, metricConfig),
        },
        axisX: {
          type: AutoScaleAxis,
          onlyInteger: true,
          labelInterpolationFnc: (value, index) => {
            if (len > 6) {
              return index % 2 === 0 ? value : null;
            }
            return value;
          },
        },
        // plugins: [
        // TODO: Re-add tooltips
        //   Chartist.plugins.tooltip({
        //     appendToBody: true,
        //     transformTooltipTextFnc: (value) => prettyNumber(
        //       Number(value.split(",")[1]),
        //       metricConfig,
        //     ),
        //   }),
        // ],
      };

      // Axis labels
      // TODO: re-add
      // if (metricConfig.label) {
      //   options.plugins.push(
      //     Chartist.plugins.ctAxisTitle({
      //       axisX: {
      //         axisTitle: "",
      //         axisClass: "ct-axis-title",
      //         offset: {
      //           x: 0,
      //           y: 50,
      //         },
      //         textAnchor: "middle",
      //       },
      //       axisY: {
      //         axisTitle: this.$t(`metricLabels.${metricConfig.label}`),
      //         axisClass: "ct-axis-title",
      //         offset: {
      //           x: 0,
      //           y: -1,
      //         },
      //         flipTitle: false,
      //         textAnchor: "middle",
      //       },
      //     }),
      //   );
      // }
      this.chart = new LineChart(
        `#ct-trendchart-${metricConfig.metric}`,
        {
          labels: this.years,
          series: [this.countyValuesChart, this.valuesChart],
        },
        options,
      );

      // Animation.
      this.chart.on("draw", (data) => {
        if (data.type === "line") {
          data.element.animate({
            d: {
              begin: 500 * data.index,
              dur: 500,
              from: data.path
                .clone()
                .scale(1, 0)
                .translate(0, data.chartRect.height())
                .stringify(),
              to: data.path.clone().stringify(),
              easing: Svg.Easing.easeOutQuint,
            },
            opacity: {
              begin: 500 * data.index,
              dur: 500,
              from: 0,
              to: 1,
            },
          });
        }
      });
    },
  },
};
</script>

<style lang="scss">
.ct-trendchart {
  margin-top: 0.5em;
}

.qol-chart .ct-series-b .ct-line,
.qol-chart .ct-series-b .ct-point {
  stroke: rgb(var(--v-theme-accent));
}
.qol-chart .ct-series-a .ct-line,
.qol-chart .ct-series-a .ct-point {
  stroke: #778b91;
}
.qol-chart .ct-series-a .ct-line {
  stroke-dasharray: 5, 2;
  stroke-width: 2;
}
.ct-axis-title {
  font-size: 10px;
  fill: rgba(0, 0, 0, 0.6);
}
.ct-area,
.ct-line {
  pointer-events: none;
}
.ct-line {
  fill: transparent;
  stroke-width: 2px;
}
// Overrides specific to report.
.report .metric-trendchart .qol-chart {
  .legend.text-center {
    text-align: left !important;
    margin-top: -30px;
  }
  p.title.text-center {
    visibility: hidden;
  }
}
</style>

<style lang="css" scoped>
.caption {
  margin: 0 0.5em;
}
.icon {
  vertical-align: middle;
  width: 1.5em;
  height: 1.5em;
}
</style>
