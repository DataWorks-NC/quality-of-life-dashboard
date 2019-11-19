<template lang="html">
  <div v-if="metric.config" id="legend" class="top left">
    <div>
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" class="background-print-img" aria-hidden="true">
      <div class="legendposition">
        <a :title="$t('legend.MoveTableOfContents')" href="javascript:void(0)" @click="position()"><v-icon>{{ mdiCursorMove }}</v-icon></a>
      </div>
      <p class="title">
        {{ $store.getters.legendTitle }}
      </p>
      <div class="metricboxes">
        <div v-if="selected.length > 0" class="metricbox">
          <span class="metrictype">{{ $t('strings.selected') | allcaps }}</span>
          <span class="metricvalue">{{ selectedValue }}</span>
          <span v-if="metric.config.label" class="metriclabel">{{ $t('metricLabels.' + metric.config.label.toLowerCase()) }}</span>
          <span v-if="metric.config.raw_label && selected.length > 0 && selectedValueRaw" class="metric-raw">
            <span>{{ $t('strings.or') }}</span>
            <span class="metricvalue metricraw">{{ selectedValueRaw }}</span>
            <span class="metriclabel" v-html="$t('metricLabels.' + metric.config.raw_label.toLowerCase())" />
          </span>
        </div>
        <div class="metricbox">
          <span class="metrictype">{{ $t('strings.county') | allcaps }}</span>
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
            <rect :style="{fill: colors[0]}" y="865.9" x="-20.7" height="25" width="50" @click="selectBreak(0)" @mouseover="changeHighlight(0)" @mouseout="changeHighlight(-1)" />
            <rect :style="{fill: colors[1]}" width="50" height="25" x="28.9" y="865.9" @click="selectBreak(1)" @mouseover="changeHighlight(1)" @mouseout="changeHighlight(-1)" />
            <rect :style="{fill: colors[2]}" width="50" height="25" x="78.5" y="865.9" @click="selectBreak(2)" @mouseover="changeHighlight(2)" @mouseout="changeHighlight(-1)" />
            <rect :style="{fill: colors[3]}" y="865.9" x="128.1" height="25" width="50" @click="selectBreak(3)" @mouseover="changeHighlight(3)" @mouseout="changeHighlight(-1)" />
            <rect :style="{fill: colors[4]}" width="50" height="25" x="177.6" y="865.9" @click="selectBreak(4)" @mouseover="changeHighlight(4)" @mouseout="changeHighlight(-1)" />
            <text x="-19.5" y="864.3" class="legendText">
              <tspan x="-19.5" y="864.3">{{ abbrNumber(breaks[0]) }}</tspan>
            </text>
            <text y="864.4" x="28.6" class="legendText">
              <tspan y="864.4" x="28.6">{{ abbrNumber(breaks[1]) }}</tspan>
            </text>
            <text x="78.4" y="864.4" class="legendText">
              <tspan x="78.4" y="864.4">{{ abbrNumber(breaks[2]) }}</tspan>
            </text>
            <text y="864.4" x="128" class="legendText">
              <tspan y="864.4" x="128">{{ abbrNumber(breaks[3]) }}</tspan>
            </text>
            <text x="177.8" y="864.4" class="legendText">
              <tspan x="177.8" y="864.4">{{ abbrNumber(breaks[4]) }}</tspan>
            </text>
            <text y="864.3" x="225.8" class="legendText">
              <tspan y="864.3" x="225.8">{{ abbrNumber(breaks[5]) }}</tspan>
            </text>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { mdiCursorMove } from '@mdi/js';
import { mapState } from 'vuex';
import config from '../modules/config';


import {
  legendLabelNumber, prettyNumber,
} from '../modules/number_format';
import { calcValue, wValsToArray, sum } from '../modules/metric_calculations';

export default {
  // You would think to just name this component 'Legend', but <legend> is in the HTML5 spec!
  name: 'DashboardLegend',
  data: () => ({
    mdiCursorMove,
    selectedValue: null,
    selectedValueRaw: null,
    colors: config.colors,
  }),
  computed: mapState({
    breaks: 'breaks',
    highlight: 'highlight',
    metric: 'metric',
    selected: 'selected',
    year: 'year',
    areaValue(state) { return prettyNumber(state.metric.averageValues[state.year].value, state.metric.config.decimals, state.metric.config.prefix, state.metric.config.suffix, state.metric.config.commas); },
    areaValueRaw(state) { return prettyNumber(state.metric.averageValues[state.year].rawValue, 0, state.metric.config.prefix); },
  }),
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
      return legendLabelNumber(value, this.metric.config);
    },
    processSelected() {
      if (!this.metric.data || !this.metric.config) return;

      const metricConfig = this.metric.config;
      const metricData = this.metric.data;

      const selectedValue = calcValue(metricData, metricConfig.type, this.year, this.selected);
      this.selectedValue = prettyNumber(selectedValue, metricConfig.decimals, metricConfig.prefix, metricConfig.suffix, metricConfig.commas);
      if (metricConfig.raw_label) {
        const rawArray = wValsToArray(metricData.map, metricData.w, [this.year], this.selected);
        let rawValue = sum(rawArray);
        if (metricConfig.suffix === '%') {
          rawValue /= 100;
        }
        this.selectedValueRaw = prettyNumber(rawValue, 0, metricConfig.prefix);
      }
    },
    position() {
      const el = document.querySelector("#legend");

      if (el.classList.contains("right")) { // move to top left from bottom right
        el.classList.remove('bottom');
        el.classList.remove('right');
        el.classList.add('top');
        el.classList.add('left');
      } else if (el.classList.contains("bottom")) { // move to bottom right from bottom left
        el.classList.remove('left');
        el.classList.add('right');
      } else if (el.classList.contains("top")) { // move to bottom left from top left\n
        el.classList.remove('top');
        el.classList.add('bottom');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#legend.top {
  top: 8px;
}

#legend.left {
  left: 8px;
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
  text-align: center;
  text-anchor: middle;
  word-spacing: 0px;
}

.legendText:first-of-type {
  text-align: start;
  text-anchor: start;
}

.legendText:last-of-type {
  text-align: end;
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
