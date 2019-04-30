<template lang="html">
  <div v-if="years.length > 1"
       :class="framework === 'mdl' ? 'qol-chart mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop mdl-typography--text-center' : 'qol-chart'">
    <div class="trendchart">
      <h1 v-if="metricConfig">{{ metricConfig.title }}</h1>
      <span class="legend"><svg class="icon legend-county"><use href="#icon-trending_up"/></svg> County</span>
      <span class="legend"><svg class="icon legend-selected"><use href="#icon-trending_up"/></svg> Selected</span>
      <div :id="'ct-trendchart-' + metricConfig.metric" class="ct-trendchart"/>
    </div>
  </div>
</template>

<script>
import Chartist from 'chartist';
import { prettyNumber } from '../modules/number_format';

require('../modules/chartist.axis.title.js');
require('../modules/chartist.tooltip.js');

export default {
  name: 'TrendChart',
  props: {
    years: {
      type: Array,
      required: true,
    },
    values: {
      type: Object,
      required: true,
    },
    countyValues: {
      type: Object,
      required: true,
    },
    metricConfig: {
      type: Object,
      required: true,
    },
    // Key to identify if this component needs to have MDL framework styling (used in the dashboard) or not.
    framework: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    // The two "chart" computed variables filter the metric objects into arrays keyed by year, leaving null gaps where there's no data for a given year.
    countyValuesChart() {
      return this.years.map((year) => {
        if (this.countyValues && this.countyValues.hasOwnProperty(year)) return { x: year, y: this.countyValues[year] };
        return null;
      });
    },
    valuesChart() {
      return this.years.map((year) => {
        if (this.values && this.values.hasOwnProperty(year)) return { x: year, y: this.values[year] };
        return null;
      });
    },
  },
  mounted() {
    this.renderChart();
  },
  updated() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      // Render chart, but only if all the data is here (so render only once).
      // Filter i=>i call returns true only if the array contains at least one non-null value.
      if (this.years.length <= 1) return;
      const metricConfig = this.metricConfig;
      const len = this.years[this.years.length - 1] - this.years[0];
      const options = {
        fullWidth: true,
        height: '180px',
        showArea: false,
        low: 0,
        chartPadding: {
          right: 40,
        },
        lineSmooth: Chartist.Interpolation.cardinal({
          fillHoles: true,
        }),
        axisY: {
          labelInterpolationFnc(value, index) {
            return prettyNumber(value, metricConfig.decimals, metricConfig.prefix,
                metricConfig.suffix);
          },
        },
        axisX: {
          type: Chartist.AutoScaleAxis,
          onlyInteger: true,
          labelInterpolationFnc(value, index) {
            if (len > 6) {
              return index % 2 === 0 ? value : null;
            }
            return value;
          },
        },
        plugins: [
          Chartist.plugins.tooltip({
            transformTooltipTextFnc(value) {
              return prettyNumber(value.split(',')[1], metricConfig.decimals, metricConfig.prefix,
                metricConfig.suffix);
            },
          }),
        ],
      };

      // Axis labels
      if (metricConfig.label) {
        options.plugins.push(Chartist.plugins.ctAxisTitle({
          axisX: {
            axisTitle: '',
            axisClass: 'ct-axis-title',
            offset: {
              x: 0,
              y: 50,
            },
            textAnchor: 'middle',
          },
          axisY: {
            axisTitle: metricConfig.label,
            axisClass: 'ct-axis-title',
            offset: {
              x: 0,
              y: -1,
            },
            flipTitle: false,
            textAnchor: 'middle',
          },
        }));
      }
      const chart = new Chartist.Line(`#ct-trendchart-${metricConfig.metric}`, {
        labels: this.years,
        series: [this.valuesChart, this.countyValuesChart],
      }, options);

      // Animation.
      chart.on('draw', (data) => {
        if (data.type === 'line') {
          data.element.animate({
            d: {
              begin: 500 * data.index,
              dur: 500,
              from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
              to: data.path.clone().stringify(),
              easing: Chartist.Svg.Easing.easeOutQuint,
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

<style lang="css">
    .qol-chart .ct-series-a .ct-line,
    .qol-chart .ct-series-a .ct-point {
        stroke: #00688B;
    }
    .qol-chart .ct-series-b .ct-line,
    .qol-chart .ct-series-b .ct-point {
        stroke: orange;
    }
    .ct-trendchart {
        margin-left: 20px;
    }
    .ct-axis-title {
        font-size: 10px;
        fill: rgba(0, 0, 0, 0.6);
    }
    .chartist-tooltip {
        position: absolute;
        display: inline-block;
        opacity: 0;
        min-width: 5em;
        padding: .5em;
        background: rgba(0, 0, 0, 0.85);
        color: #ccc;
        font-family: Oxygen, Helvetica, Arial, sans-serif;
        font-weight: 700;
        text-align: center;
        pointer-events: none;
        z-index: 1;
        border-radius: 5px;
        transition: opacity .2s linear;
    }
    .chartist-tooltip:before {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        width: 0;
        height: 0;
        margin-left: -15px;
        border: 15px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.85);
    }
    .chartist-tooltip.tooltip-show {
        opacity: 1;
    }
    .ct-area,
    .ct-line {
        pointer-events: none;
    }
    .ct-line {
        fill: transparent;
        stroke-width: 2px;
    }
</style>

<style lang="css" scoped>
    h1 {
        font-size: 1.1em;
        margin: 15px 0 0;
    }
    span.legend {
        font-size: 0.8em;
    }
    .icon {
        vertical-align: middle;
        width: 1.5em;
        height: 1.5em;
    }
    .legend-selected {
        color: #00688B;
    }
    .legend-county {
        color: orange;
    }
</style>
