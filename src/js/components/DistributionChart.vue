<template>
  <v-card>
    <p class="text-h6 text-center">
      {{ $t('distributionChart.DataDistribution') }}, {{ store.year }}
    </p>
    <div class="legend text-center">
      <span v-show="selected.length > 0" class="text-caption"><v-icon color="accent" size="14px" :icon="mdiCircle" /> {{ $filters.capitalize($t('strings.selected')) }}</span>
      <span v-if="mounted" class="text-caption"><v-icon size="14px" color="#666" :icon="mdiDotsHorizontal" /> {{ $t('strings.CountyAverage') }}: {{ countyAverageString }}</span>
    </div>
    <div class="ct-distributionchart chartist" />
  </v-card>
</template>

<script>
import 'chartist/dist/index.css';
import { mdiCircle, mdiDotsHorizontal } from "@mdi/js";
import { store } from '@/js/stores/compass-store.js';
import { isFinite } from 'lodash-es';

import { LineChart } from 'chartist';
import { legendLabelNumber, prettyNumber } from '@/js/helpers/numberFormat.js';
import {ctAxisTitle } from '@/js/helpers/ctAxisTitle';
import {ctTooltip} from '@/js/helpers/ctTooltip';
import brushBreaksCategoriesMixin from '@/js/components/mixins/brushBreaksCategoriesMixin';

export default {
  name: 'DistributionChart',
  mixins: [brushBreaksCategoriesMixin,],
  inject: ['selected', 'breaks', 'metric', 'geography'],
  props: {
    countyValues: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({ mounted: false, mdiCircle, mdiDotsHorizontal, store }),
  computed: {
    countyAverage() {
      return this.store.year in this.countyValues ? this.countyValues[this.store.year] : false;
    },
    countyAverageString() {
      return this.countyAverage && prettyNumber(this.countyAverage, this.metric.config);
    },
  },
  watch: {
    'metric': 'renderChart',
    'selected': 'renderChart',
    'store.year': 'renderChart',
  },
  beforeCreate() {
    // Set these here rather than as data so that they are not reactive.
    this.chart = null;
    this.chartData = null;
  },
  mounted() {
    this.renderChart();
    this.mounted = true;
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.detach();
    }
  },
  methods: {
    renderChart() {
      const data = this.updateData();
      if (!data) return;

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
          labelInterpolationFnc: () => null,
        },
        axisY: {
          labelInterpolationFnc: (value) => legendLabelNumber(value, this.metric.config),
        },
        series: {
          'series-selected': {
            showLine: false,
            showPoint: true,
            showArea: false,
          },
          'series-average': {
            showLine: true,
            showPoint: false,
            showArea: false,
          },
        },
      };

      this.chart = new LineChart('.ct-distributionchart', data, options);

      const addTooltips = ctTooltip({
        appendToBody: true,
        transformTooltipTextFnc: (value) => prettyNumber(value, this.metric.config)
      });
      addTooltips(this.chart);

      // Axis labels
      if (this.metric.config.label) {
        const addAxisTitles = ctAxisTitle({
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
            axisTitle: this.$t(`metricLabels.${this.metric.config.label}`),
            axisClass: 'ct-axis-title',
            offset: {
              x: 0,
              y: 5,
            },
            flipTitle: true,
            textAnchor: 'middle',
          },
        });
        addAxisTitles(this.chart);
      }

      this.makeBrushable();
    },
    makeBrushable() {
      const isSeries = e => e.target.classList.contains('ct-area');
      this.chart.container.addEventListener('mouseover', (e) => {
        if (isSeries(e)) {
          const seriesName = e.target.parentNode.getAttribute('ct:series-name');
          if (!seriesName) {
            return;
          }

          const breakNumber = Number(seriesName[seriesName.length - 1]) - 1;
          this.changeHighlight(breakNumber);
        }
      });

      this.chart.container.addEventListener('mouseout', (e) => {
          if (isSeries(e)) {
            this.changeHighlight(-1);
          }
          });

      this.chart.container.addEventListener('click', (e) => {
        if (isSeries(e)) {
          const seriesName = e.target.parentNode.getAttribute('ct:series-name');
          if (!seriesName) {
            return;
          }

          const breakNumber = Number(seriesName[seriesName.length - 1]) - 1;
          this.selectBreak(breakNumber);
        }
      })
    },
    updateData() {
      const chartData = {
        labels: [],
        series: [],
      };
      const _this = this;
      const { metric } = this;
      if (!metric.data) return false;

      // get values
      const data = this.dataToSortedArray(metric.data.map, this.store.year);

      // populate chart data
      const dataArrayA = [];
      const dataArrayB = [];
      const dataArrayC = [];
      const dataArrayD = [];
      const dataArrayE = [];
      const dataArrayCountyAverage = [];
      const dataArraySelected = [];

      for (let i = 0; i < data.length; i += 1) {
        // set chart labels
        chartData.labels.push(data[i].id);
        // set selected points
        if (_this.selected.indexOf(data[i].id) !== -1) {
          dataArraySelected.push({ meta: (_this.$i18n.locale === 'es' ? _this.geography.label_es(data[i].id) : _this.geography.label(data[i].id)), value: data[i].val });
        } else {
          dataArraySelected.push(null); // This is needed to have padding values so that the selected points show up in the right place on x-axis.
        }
        // set county average
        dataArrayCountyAverage.push(this.countyAverage);

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
      if (this.countyAverage) {
        chartData.series.push({ name: 'series-average', data: dataArrayCountyAverage });
      }
      chartData.series.push({ name: 'series-selected', data: dataArraySelected });

      return chartData;
    },
    dataToSortedArray(data, year) {
      const dataArray = [];
      const keys = Object.keys(data);

      for (let i = 0; i < keys.length; i += 1) {
        if (isFinite(data[keys[i]][`y_${year}`])) {
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
.ct-distributionchart {
  margin-top: 0.5em;
}
/* selected */
.ct-distributionchart .ct-point {
    stroke: rgb(var(--v-theme-accent)) !important;
}

/* distribution series */
.ct-distributionchart .ct-area {
    fill-opacity: 1;

    /* Needed for interactivity on mouseover */
    pointer-events: visible;
}
.ct-distributionchart .ct-series-a .ct-line, .ct-distributionchart .ct-series-a .ct-area {
    stroke: #b2f3ed;
    fill: #b2f3ed;
}
.ct-distributionchart .ct-series-b .ct-line, .ct-distributionchart .ct-series-b .ct-area {
    stroke: #74ced5;
    fill: #74ced5;
}
.ct-distributionchart .ct-series-c .ct-line, .ct-distributionchart .ct-series-c .ct-area {
    stroke: #418ea6;
    fill: #418ea6;
}
.ct-distributionchart .ct-series-d .ct-line, .ct-distributionchart .ct-series-d .ct-area {
    stroke: #1a4d6f;
    fill: #1a4d6f;
}
.ct-distributionchart .ct-series-e .ct-line, .ct-distributionchart .ct-series-e .ct-area {
    stroke: #00214d;
    fill: #00214d;
}

/* ct-series-f == county average */
.ct-distributionchart .ct-series-f .ct-line {
    stroke: #778b91;
    stroke-dasharray: 5, 2;
    stroke-width: 2;
}
</style>

<style lang="css" scoped>
    .caption {
      margin: 0 0.5em;
    }
</style>
