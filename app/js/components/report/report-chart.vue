<template lang="html" functional>
  <div v-if="averageValues && values" class="qol-chart">
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
import { abbrNum, round, prettyNumber } from '../../modules/number_format';

require('../../modules/chartist.axis.title.js');
require('../../modules/chartist.tooltip.js');

export default {
  name: 'ReportChart',
  props: {
    years: {
      type: Array,
      required: true,
    },
    values: {
      type: Array,
      required: true,
    },
    averageValues: {
      type: Array,
      required: true,
    },
    metricConfig: {
      type: Object,
      required: true,
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
      if (!this.years.length || !this.values.filter(i => i).length || !this.averageValues.filter(i => i).length || this.years.length <= 1) return;
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
            return abbrNum(round(Number(value), 2), 2);
          },
        },
        axisX: {
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
              return prettyNumber(value, metricConfig.decimals, metricConfig.prefix,
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
        series: [this.values, this.averageValues],
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
