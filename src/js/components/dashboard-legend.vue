<template>
  <div v-if="metric.config" id="legend" :class="legendClass">
    <div>
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" class="background-print-img" aria-hidden="true" alt="">
      <div class="legendposition">
        <a class="no-underline" :title="$t('legend.MoveTableOfContents')" href="javascript:void(0)" @click="cyclePosition">
          <v-icon>mdi-cursor-move</v-icon>
        </a>
      </div>
      <h1 class="text-h6">
        {{ $store.getters.legendTitle }}
      </h1>
      <div class="metricboxes">
        <div v-if="selected.length > 0" class="metricbox">
          <span class="metrictype">{{ $filters.allcaps($t('strings.selected')) }}</span>
          <span class="metricvalue">{{ selectedValue }}</span>
          <span v-if="metric.config.label" class="metriclabel">{{ $t('metricLabels.' + metric.config.label.toLowerCase()) }}</span>
          <span v-if="metric.config.raw_label && selected.length > 0 && selectedValueRaw" class="metric-raw">
            <span>{{ $t('strings.or') }}</span>
            <span class="metricvalue metricraw">{{ selectedValueRaw }}</span>
            <span class="metriclabel" v-html="$t('metricLabels.' + metric.config.raw_label.toLowerCase())" />
          </span>
        </div>
        <div class="metricbox">
          <span class="metrictype">{{ $filters.allcaps($t('strings.county')) }}</span>
          <span class="metricvalue">{{ areaValue }}</span>
          <span v-if="metric.config.label" class="metriclabel">{{ $t('metricLabels.' + metric.config.label.toLowerCase()) }}</span>
          <span v-if="metric.config.raw_label && areaValueRaw" class="metric-raw">
            <span>{{ $t('strings.or') }}</span>
            <span class="metricvalue metricraw">{{ areaValueRaw }}</span>
            <span class="metriclabel" v-html="$t('metricLabels.' + metric.config.raw_label.toLowerCase())" />
          </span>
        </div>
      </div>
      <div class="legend">
        <svg v-if="breaks" id="maplegend" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 248.4 39.2" role="img" aria-labelledby="svgTitle">
          <title id="svgTitle">{{ $t('legend.ChoroplethLegend') }}</title>
          <g transform="translate(20.714293 -851.75475)">
            <!--     @TODO add aria labels for these mouseover actions       -->
            <g v-for="(breakval, i) in breaks" :key="`legend-patch-${i}`" :class="[i === 0 && 'first', i === breaks.length - 1 && 'last']">
              <rect :style="{fill: colors[i]}" y="865.9" :x="-20.7 + 50*i" height="25" width="50" @click="selectBreak(i)" @mouseover="changeHighlight(i)" @mouseout="changeHighlight(-1)" />
              <text :x="-20.7 + 50*i - (i === breaks.length - 1 ? 2.5 : 0)" y="864.3" class="legendText">
                {{ abbrNumber(breakval) }}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import config from '../modules/config';

import {
  legendLabelNumber, prettyNumber,
} from '../modules/number_format';
import { calcValue, wValsToArray, sum } from '../modules/metric_calculations';

export default {
  // You would think to just name this component 'Legend', but <legend> is in the HTML5 spec!
  name: 'DashboardLegend',
  data: () => ({
    selectedValue: null,
    selectedValueRaw: null,
    colors: config.colors,
    position: 'top-left',
  }),
  computed: {
    ...mapState({
      breaks: 'breaks',
      highlight: 'highlight',
      metric: 'metric',
      year: 'year',
      areaValue(state) { return prettyNumber(state.metric.averageValues[state.year].value, state.metric.config); },
      areaValueRaw(state) { return prettyNumber(state.metric.averageValues[state.year].rawValue, { prefix: state.metric.config.prefix }); },
    }),
    ...mapGetters(['selected']),
    legendClass() {
      return {
        top: this.position.startsWith('top'),
        bottom: this.position.startsWith('bottom'),
        'float-left': this.position.endsWith('left'),
        'float-right': this.position.endsWith('right'),
      }
    }
  },
  watch: {
    'metric': 'processSelected',
    'selected': 'processSelected',
    'year': 'processSelected',
  },
  mounted() {
    this.processSelected();
  },
  methods: {
    changeHighlight(n) {
      if (n === -1) {
        this.$store.commit('setHighlight', []);
      } else {
        this.$store.commit('setHighlight', this.getBreakIds(n));
      }
    },
    selectBreak(n) {
      this.$router.push({ query: { ...this.$route.query, selected: this.getBreakIds(n) } });
    },
    getBreakIds(n) {
      const data = this.metric.data.map;
      const ids = [];

      // loop through data to get id's
      Object.keys(data).forEach((id) => {
        const value = data[id][`y_${this.year}`];

        if (value !== null && value >= this.breaks[n] && value < this.breaks[n + 1]) {
          ids.push(id.toString());
        }
      });

      return ids;
    },

    abbrNumber(value) {
      return legendLabelNumber(value, this.metric.config, false);
    },
    processSelected() {
      if (!this.metric.data || !this.metric.config) return;

      const metricConfig = this.metric.config;
      const metricData = this.metric.data;

      const selectedValue = calcValue(metricData, metricConfig.type, this.year, this.selected);
      this.selectedValue = prettyNumber(selectedValue, metricConfig);
      if (metricConfig.raw_label) {
        const rawArray = wValsToArray(metricData.map, metricData.w, [this.year], this.selected);
        let rawValue = sum(rawArray);
        if (metricConfig.suffix === '%') {
          rawValue /= 100;
        }
        this.selectedValueRaw = prettyNumber(rawValue, { prefix: metricConfig.prefix });
      }
    },
    cyclePosition() {
      console.log('Change position');
      if (this.position === 'top-left') {
        this.position = 'bottom-left';
      } else if (this.position === 'bottom-left') {
        this.position = 'bottom-right';
      } else if (this.position === 'bottom-right') {
        this.position = 'top-right';
      } else if (this.position === 'top-right') {
        this.position = 'top-left';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* #legend.top, .left, .bottom, and .right all need to be defined so that the legend reposition button works. */
#legend.top {
  top: 8px;
}

#legend.left {
  left: 8px;
}

#legend.bottom {
  bottom: 8px;
}

#legend.right {
  right: 8px;
}

#legend {
  position: absolute;
  width: 260px;
  background: white;
}

.legendposition {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.8em;
  z-index: 1;
}

.legendposition a {
  color: #333;
  opacity: 0.2;
  transition: opacity 0.5s;
}

.legendposition a:hover {
  opacity: 0.8;
}

.legendposition .icon {
  width: 14px;
  height: 14px;
  fill: #ccc;
}

.title, .description, .legend, .metricboxes {
  position: relative;
}

.metricboxes {
  padding: 3px 0 10px;
  text-align: center;
  display: flex;
  flex-flow: row nowrap;
}

.metricbox {
  width: 50%;
  padding: 0 10px;
  margin: 0 auto;

}

.metricbox span {
  display: block;
  font-size: 12px;
}

.metrictype {
  font-weight: bold;
  font-size: 12px;
  color: #727272;
}

.metricvalue {
  margin-top: 0;
  font-weight: bold;
  font-size: 16px !important;
}

.metricvalue.metricraw {
  font-size: 13px !important;
}

.metriclabel {
  line-height: 1.3em;
}

.title {
  padding: 10px 10px 7px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  word-wrap: break-word;
  font-size: 15px;
}

h1, h2 {
  margin: 0;
  line-height: normal;
}

h1 {
  font-weight: bold;
  line-height: 20px;
}

h2 {
  font-weight: normal;
}

svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 41px;
  /*pointer-events: none;*/
  /* fix for ie11 click making legend disappear */
}

.legendText {
  font-size: 10px;
  letter-spacing: 0px;
  line-height: 100%;
  stroke-width: 1px;
  text-anchor: middle;
  word-spacing: 0px;
}

.first .legendText {
  text-anchor: start;
}

.last .legendText {
  text-anchor: end;
}

.background-print-img {
  display: none;
}

@media print {
  .background-print-img {
    display: block;
    width: 100%;
    height: 99%;
    position: absolute;
    left: 0;
    top: 0;
  }
  .legendposition {
    display: none;
  }
}

@media all and (max-width: 480px) {
  .metric-raw {
    display: none !important;
  }
  #legend {
    width: 200px;
  }
}
</style>
