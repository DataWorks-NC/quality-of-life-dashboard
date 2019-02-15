<template lang="html">
  <div v-if="metricConfig" id="legend" class="top left">
    <div>
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" class="background-print-img" alt="white background for printing">
      <div class="legendposition">
        <a href="javascript:void(0)" title="Move Table of Contents" @click="position()"><svg class="icon"><use href="#icon-zoom_out_map"/></svg></a>
      </div>
      <h1 class="title">{{ metricConfig.title }}, {{ year }}</h1>
      <div class="metricboxes">
        <div v-if="selected.length > 0" class="metricbox">
          <span class="metrictype">SELECTED</span>
          <span class="metricvalue">{{ selectedValue }}</span>
          <span v-if="metricConfig.label" class="metriclabel">{{ metricConfig.label.toLowerCase() }}</span>
          <span v-if="metricConfig.raw_label && selected.length > 0 && selectedValueRaw" class="metric-raw">
            <span>or</span>
            <span class="metricvalue metricraw">{{ selectedValueRaw }}</span>
            <span class="metriclabel" v-html="metricConfig.raw_label.toLowerCase()"/>
          </span>
        </div>
        <div class="metricbox">
          <span class="metrictype">COUNTY</span>
          <span class="metricvalue">{{ areaValue }}</span>
          <span v-if="metricConfig.label" class="metriclabel">{{ metricConfig.label.toLowerCase() }}</span>
          <span v-if="metricConfig.raw_label && areaValueRaw" class="metric-raw">
            <span>or</span>
            <span class="metricvalue metricraw">{{ areaValueRaw }}</span>
            <span class="metriclabel" v-html="metricConfig.raw_label.toLowerCase()"/>
          </span>
        </div>
      </div>
      <div class="legend">
        <svg v-if="breaks" id="maplegend" xmlns="https://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 248.4 39.2" role="img" aria-labelledby="svgTitle">
          <title id="svgTitle">Choropleth legend</title>
          <g transform="translate(20.714293 -851.75475)">
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
import config from '../modules/config';

import { mapState } from 'vuex';

import {
  legendLabelNumber, prettyNumber,
} from '../modules/number_format';
import { calcValue, wValsToArray, sum } from '../modules/metric_calculations';

export default {
  // You would think to just name this component 'Legend', but <legend> is in the HTML5 spec!
  name: 'dashboard-legend',
  data: () => ({
    selectedValue: null,
    selectedValueRaw: null,
    areaValue: null,
    areaValueRaw: null,
    colors: config.colors,
  }),
  computed: mapState({
    breaks: 'breaks',
    highlight: 'highlight',
    metricConfig(state) { return state.metric.config; },
    metricData(state) { return state.metric.data; },
    selected: 'selected',
    year: 'year',
  }),
  watch: {
    'metricData': 'processData',
    'selected': 'processSelected',
    'year': 'processYear',
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
      this.$store.commit('setSelected', this.getBreakIds(n));
    },
    getBreakIds(n) {
      const _this = this;
      const data = this.metricData.map;
      const breaks = this.breaks;
      const ids = [];

      // loop through data to get id's
      Object.keys(data).forEach((id) => {
        const value = data[id][`y_${_this.year}`];

        if (value !== null && value >= breaks[n] && value <= breaks[n + 1]) {
          ids.push(id.toString());
        }
      });

      return ids;
    },

    abbrNumber(value) {
      return legendLabelNumber(value, this.metricConfig);
    },
    processData() {
      if (!this.metricData || !this.metricConfig) return;
      this.processArea();
      this.processSelected();
    },
    processSelected() {
      if (!this.metricData || !this.metricConfig) return;

      const metricConfig = this.metricConfig;
      const metricData = this.metricData;

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
    processArea() {
      if (!this.metricData || !this.metricConfig) return;

      const metricConfig = this.metricConfig;
      const metricData = this.metricData;
      const keys = Object.keys(this.metricData.map);

      if (metricConfig.world_val && metricConfig.world_val[`y_${this.year}`]) {
        this.areaValue = prettyNumber(metricConfig.world_val[`y_${this.year}`], metricConfig.decimals, metricConfig.prefix, metricConfig.suffix, metricConfig.commas);
      } else {
        const areaValue = calcValue(metricData, metricConfig.type, this.year, keys);
        this.areaValue = prettyNumber(areaValue, metricConfig.decimals, metricConfig.prefix, metricConfig.suffix, metricConfig.commas);
      }
      if (metricConfig.raw_label) {
        const rawArray = wValsToArray(metricData.map, metricData.w, [this.year], keys);
        let rawValue = sum(rawArray);
        if (metricConfig.suffix === '%') {
          rawValue /= 100;
        }
        this.areaValueRaw = prettyNumber(rawValue, 0, metricConfig.prefix);
      }
    },
    processYear() {
      this.processArea();
      this.processSelected();
    },
    position() {
      const el = document.querySelector("#legend");

      // move to top left from bottom right
      if (el.classList.contains("right")) {
        el.classList.remove('bottom');
        el.classList.remove('right');
        el.classList.add('top');
        el.classList.add('left');
      }
      // move to bottom right from bottom left
      else if (el.classList.contains("bottom")) {
        el.classList.remove('left');
        el.classList.add('right');
      }
      // move to bottom left from top left
      else if (el.classList.contains("top")) {
        el.classList.remove('top');
        el.classList.add('bottom');
      }
    },
  },
};
</script>

<style lang="css" scoped>
#legend.top {
    top: -1px;
}
#legend.bottom {
    bottom: -1px;
}
#legend.left {
    left: -1px;
}
#legend.right {
    right: -1px;
}
#legend {
    position: absolute;
    width: 260px;
    background: white;
    /*box-shadow: 0 1px 3px #666, 0 6px 5px -5px #666;*/
}

.legendposition {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 0.8em;
    z-index: 20;
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
  z-index: 10;
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
  border-bottom: 1px solid rgba(0,0,0,0.15);
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
    /*pointer-events: none;*/ /* fix for ie11 click making legend disappear */
}

.legendText {
    font-family:'Roboto', sans-serif;
    font-size: 10px;
    letter-spacing:0px;
    line-height:100%;
    stroke-width:1px;
    text-align:center;
    text-anchor:middle;
    word-spacing:0px;
}

.legendText:first-of-type {
    text-align:start;
    text-anchor:start;
}
.legendText:last-of-type {
    text-align:end;
    text-anchor:end;
}

.background-print-img{
    display: none;
}

@media print{
    .background-print-img{
        display: block;
        width:100%;
        height: 99%;
        position:absolute;
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
