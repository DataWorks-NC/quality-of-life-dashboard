<template lang="html">
  <div v-show="metric.years.length > 1" class="qol-chart mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop mdl-typography--text-center">
    <div class="trendchart">
      <h1 v-if="metric.config">{{ metric.config.title }}</h1>
      <span class="legend"><svg class="icon legend-county"><use href="#icon-trending_up"/></svg> County</span>
      <span v-show="selected.length > 0" class="legend"><svg class="icon legend-selected"><use href="#icon-trending_up"/></svg> Selected</span>
      <div class="ct-trendchart"/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Chartist from 'chartist';
import isNumeric from '../modules/isnumeric';
import { calcValue } from '../modules/metric_calculations';
import { legendLabelNumber, prettyNumber } from '../modules/number_format';

require('../modules/chartist.axis.title.js');
require('../modules/chartist.tooltip.js');

export default {
  name: 'Trendchart',
  computed: mapState(['metric', 'selected']),
  watch: {
    'metric.data': 'renderChart',
    'selected': 'renderChart',
  },
  methods: {
    renderChart() {
      if (this.metric.years.length > 1) {
        const _this = this;
        const data = this.updateData();

        // Set low and high values of axes based on overall data set.
        const low = Object.values(this.metric.data.map).reduce((previous, val) => {
          if (previous === null) {
            return Math.min(...Object.values(val).filter(isNumeric));
          }
          return Math.min(previous,
            ...Object.values(val).filter(isNumeric),
          );
        }, null);

        const options = {
          fullWidth: true,
          height: '180px',
          showArea: false,
          low,
          lineSmooth: Chartist.Interpolation.cardinal({
            fillHoles: true,
          }),
          axisY: {
            labelInterpolationFnc: (value, index) => (legendLabelNumber(value, _this.metric.config)),
          },
          plugins: [
            Chartist.plugins.tooltip({
              transformTooltipTextFnc (value) {
                return prettyNumber(value, _this.metric.config.decimals, _this.metric.config.prefix, _this.metric.config.suffix, _this.metric.config.commas);
              },
            }),
          ],
        };
        // axis labels
        if (_this.metric.config.label) {
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
              axisTitle: _this.metric.config.label,
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

        this.chart = new Chartist.Line('.ct-trendchart', data, options);
        // animation
        this.chart.on('draw', (data) => {
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
      } else if (this.chart) {
        this.chart.detach();
        this.chart = null;
      }
    },
    updateData() {
      const metric = this.metric;
      const chartData = {
        labels: metric.years,
        series: [],
      };

      // county values
      const keys = Object.keys(metric.data.map);
      const areaArray = [];

      // county value
      for (let i = 0; i < chartData.labels.length; i++) {
        let areaValue = null;
        if (metric.years.indexOf(chartData.labels[i].toString()) !== -1) {
          if (metric.config.world_val && metric.config.world_val[`y_${chartData.labels[i]}`]) {
            areaValue = metric.config.world_val[`y_${chartData.labels[i]}`];
          } else {
            areaValue = calcValue(metric.data, metric.config.type, chartData.labels[i], keys);
          }
        }
        areaArray.push({
          meta: 'County',
          value: areaValue,
        });
      }
      chartData.series.push(areaArray);
      // selected values
      if (this.selected.length > 0) {
        const selectedArray = [];
        for (let i = 0; i < chartData.labels.length; i++) {
          if (metric.years.indexOf(chartData.labels[i].toString()) !== -1) {
            const selectedValue = calcValue(metric.data, metric.config.type, chartData.labels[i], this.selected);
            selectedArray.push({
              meta: 'Selected',
              value: selectedValue,
            });
          } else {
            selectedArray.push(null);
          }
        }
        chartData.series.push(selectedArray);
      }
      return chartData;
    },
  },
};
</script>

<style lang="css">
    .qol-chart .ct-series-b .ct-line,
    .qol-chart .ct-series-b .ct-point {
        stroke: #00688B;
    }
    .qol-chart .ct-series-a .ct-line,
    .qol-chart .ct-series-a .ct-point {
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
