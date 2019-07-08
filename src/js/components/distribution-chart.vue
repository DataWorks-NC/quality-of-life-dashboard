<template lang="html">
  <div class="qol-chart mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
    <div class="scatterplot mdl-typography--text-center">
      <h1>{{ $t('distributionChart.DataDistribution') }}, {{ year }}</h1>
      <span v-show="selected.length > 0"><svg class="icon legend legend-selected"><use href="#icon-lens"/></svg> {{ $t('strings.selected') || capitalize }}</span>
      <span><svg class="icon legend legend-median"><use href="#icon-more_horiz"/></svg> {{ $t('strings.median') || capitalize }} {{ median }}</span>
      <div class="ct-distributionchart"/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Chartist from '../modules/chartist';
import isNumeric from '../modules/isnumeric';
import { legendLabelNumber, prettyNumber } from '../modules/number_format';
import { median } from '../modules/metric_calculations';

export default {
  name: 'DistributionChart',
  computed: mapState(['breaks', 'metric', 'selected', 'year']),
  watch: {
    'metric.data': 'renderChart',
    'selected': 'renderChart',
    'year': 'renderChart',
  },
  mounted() {
    // Set these here rather than as data so they are not reactive.
    this.median = null;
    this.chart = null;
    this.chartData = null;
  },
  methods: {
    renderChart() {
      const data = this.updateData();
      if (!data) return;
      const _this = this;

      const options = {
        showLine: false,
        showPoint: false,
        showArea: true,
        fullWidth: true,
        height: '160px',
        chartPadding: {
          bottom: 0,
        },
        axisX: {
          labelInterpolationFnc(value, index) {
            return null;
          },
        },
        axisY: {
          labelInterpolationFnc: (value, index) => (legendLabelNumber(value, _this.metric.config)),
        },
        series: {
          'series-selected': {
            showLine: false,
            showPoint: true,
            showArea: false,
          },
          'series-median': {
            showLine: true,
            showPoint: false,
            showArea: false,
          },
        },
        plugins: [
          Chartist.plugins.tooltip({
            transformTooltipTextFnc(value) {
              return prettyNumber(value, _this.metric.config.decimals, _this.metric.config.prefix,
                  _this.metric.config.suffix);
            },
          }),
        ],
      };
      this.chart = new Chartist.Line('.ct-distributionchart', data, options);
    },
    updateData() {
      const chartData = {
        labels: [],
        series: [],
      };
      const _this = this;
      const metric = this.metric;
      if (!metric.data) return;

      // get values
      const data = this.dataToSortedArray(metric.data.map, this.year);
      const med = median(data.map(el => el.val));
      _this.median = prettyNumber(med, metric.config.decimals, metric.config.prefix, metric.config.suffix, metric.config.commas);

      // populate chart data
      const dataArrayA = [];
      const dataArrayB = [];
      const dataArrayC = [];
      const dataArrayD = [];
      const dataArrayE = [];
      const dataArrayMedian = [];
      const dataArraySelected = [];

      for (let i = 0; i < data.length; i++) {
        // set chart labels
        chartData.labels.push(data[i].id);
        // set selected points
        if (_this.selected.indexOf(data[i].id) !== -1) {
          dataArraySelected.push({ meta: _this.$store.state.geography.label(data[i].id), value: data[i].val });
        } else {
          dataArraySelected.push(null); // This is needed to have padding values so that the selected points show up in the right place on x-axis.
        }
        // set median
        if (i === 0 || i === data.length - 1) {
          dataArrayMedian.push(med);
        } else {
          dataArrayMedian.push(med);
        }

        // set lines based on breaks
        if (data[i].val <= _this.breaks[1]) {
          dataArrayA.push(data[i].val);
          dataArrayB.push(null);
          dataArrayC.push(null);
          dataArrayD.push(null);
          dataArrayE.push(null);
        } else if (data[i].val <= _this.breaks[2]) {
          dataArrayB.push(data[i].val);
          dataArrayA.push(null);
          dataArrayC.push(null);
          dataArrayD.push(null);
          dataArrayE.push(null);
        } else if (data[i].val <= _this.breaks[3]) {
          dataArrayC.push(data[i].val);
          dataArrayB.push(null);
          dataArrayA.push(null);
          dataArrayD.push(null);
          dataArrayE.push(null);
        } else if (data[i].val <= _this.breaks[4]) {
          dataArrayD.push(data[i].val);
          dataArrayB.push(null);
          dataArrayC.push(null);
          dataArrayA.push(null);
          dataArrayE.push(null);
        } else {
          dataArrayE.push(data[i].val);
          dataArrayB.push(null);
          dataArrayC.push(null);
          dataArrayD.push(null);
          dataArrayA.push(null);
        }
      }
      chartData.series.push({ name: 'series-1', data: dataArrayA });
      chartData.series.push({ name: 'series-2', data: dataArrayB });
      chartData.series.push({ name: 'series-3', data: dataArrayC });
      chartData.series.push({ name: 'series-4', data: dataArrayD });
      chartData.series.push({ name: 'series-5', data: dataArrayE });
      chartData.series.push({ name: 'series-median', data: dataArrayMedian });
      chartData.series.push({ name: 'series-selected', data: dataArraySelected });

      return chartData;
    },
    dataToSortedArray(data, year) {
      const dataArray = [];
      const keys = Object.keys(data);

      for (let i = 0; i < keys.length; i++) {
        if (isNumeric(data[keys[i]][`y_${year}`])) {
          dataArray.push({ "id": keys[i], "val": data[keys[i]][`y_${year}`] });
        }
      }

      dataArray.sort((a, b) => a.val - b.val);

      this.chartData = dataArray;

      return dataArray;
    },
  },
};
</script>

<style>
    /* selected */
    .ct-distributionchart .ct-point {
        stroke: #00688B;
    }

    /* distribution series */
    .ct-distributionchart .ct-area {
        fill-opacity: 1;
    }
    .ct-distributionchart .ct-series-a .ct-line, .ct-distributionchart .ct-series-a .ct-area {
        stroke: rgb(238,250,227);
        fill: rgb(238,250,227);
    }
    .ct-distributionchart .ct-series-b .ct-line, .ct-distributionchart .ct-series-b .ct-area {
        stroke: rgb(186,228,188);
        fill: rgb(186,228,188);
    }
    .ct-distributionchart .ct-series-c .ct-line, .ct-distributionchart .ct-series-c .ct-area {
        stroke: rgb(123,204,196);
        fill: rgb(123,204,196);
    }
    .ct-distributionchart .ct-series-d .ct-line, .ct-distributionchart .ct-series-d .ct-area {
        stroke: rgb(67,162,202);
        fill: rgb(67,162,202);
    }
    .ct-distributionchart .ct-series-e .ct-line, .ct-distributionchart .ct-series-e .ct-area {
        stroke: rgb(8,104,172);
        fill: rgb(8,104,172);
    }
    .ct-distributionchart .ct-series-f .ct-line {
        stroke: #666;
        stroke-dasharray: 5, 2;
        stroke-width: 2;
    }
</style>

<style lang="css" scoped>

    h1 {
        font-size: 1.1em;
        margin: 15px 0 0;
    }
    span {
        font-size: 0.8em;
    }
    .legend {
        font-size: 1.2em;
    }
    .legend-selected {
        color: #00688B;
    }
    .legend-median {
        fill: #666;
        width: 14px;
        height: 14px;
    }

</style>
