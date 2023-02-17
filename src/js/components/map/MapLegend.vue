<template>
  <div v-if="metric.config" id="legend" :class="legendClass">
    <div>
      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" class="background-print-img" aria-hidden="true" alt="">
      <div class="legendposition">
        <a class="no-underline" :title="$t('legend.MoveTableOfContents')" href="javascript:void(0)" @click="cyclePosition">
          <v-icon :icon="icons.mdiCursorMove" />
        </a>
      </div>
      <h1 class="text-h6 legend--title">
        {{ legendTitle }}
      </h1>
      <div class="metricboxes">
        <div v-if="selected.length > 0" class="metricbox">
          <span class="metrictype">{{ $filters.allcaps($t('strings.selected')) }}</span>
          <span class="metricvalue">{{ selectedValue }}</span>
          <span v-if="metric.config.label" class="metriclabel">{{ $t('metricLabels.' + metric.config.label.toLowerCase()) }}</span>
          <span v-if="metric.config.raw_label && selected.length > 0 && selectedValueRaw" class="metric-raw">
            <span>{{ $t('strings.or') }}</span>
            <span class="metricvalue metricraw">{{ selectedValueRaw }}</span>
            <span class="metriclabel">{{ $t('metricLabels.' + metric.config.raw_label.toLowerCase()) }}</span>
          </span>
        </div>
        <div class="metricbox">
          <span class="metrictype">{{ $filters.allcaps($t('strings.county')) }}</span>
          <span class="metricvalue">{{ areaValue }}</span>
          <span v-if="metric.config.label" class="metriclabel">{{ $t('metricLabels.' + metric.config.label.toLowerCase()) }}</span>
          <span v-if="metric.config.raw_label && areaValueRaw" class="metric-raw">
            <span>{{ $t('strings.or') }}</span>
            <span class="metricvalue metricraw">{{ areaValueRaw }}</span>
            <span class="metriclabel">{{ $t('metricLabels.' + metric.config.raw_label.toLowerCase()) }}</span>
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
import { store } from '@/js/stores/compass-store.js';

import config from '../../helpers/config';
import { mdiCursorMove } from '@mdi/js';

import brushBreaksCategoriesMixin from '../mixins/brushBreaksCategoriesMixin';
import {
  legendLabelNumber, prettyNumber,
} from '../../helpers/numberFormat.js';
import { calcValue, wValsToArray, sum } from '../../helpers/metricCalculations.js';

export default {
  // You would think to just name this component 'Legend', but <legend> is in the HTML5 spec!
  name: 'MapLegend',
  mixins: [brushBreaksCategoriesMixin,],
  inject: [
    'selected', 'metric', 'legendTitle'
  ],
  data: () => ({
    colors: config.colors,
    position: 'top-left',
    icons: {
      mdiCursorMove,
    },
    store,
  }),
  computed: {
    areaValue() {
      if (this.metric.averageValues && this.store.year in this.metric.averageValues) {
        return prettyNumber(this.metric.averageValues[this.store.year].value, this.metric.config);
      }
      return '';
    },
    areaValueRaw() {
      if (this.metric.averageValues && this.store.year in this.metric.averageValues) {
        return this.metric.averageValues &&
          prettyNumber(this.metric.averageValues[this.store.year].rawValue,
            {prefix: this.metric.config.prefix});
      }
      return '';
    },
    legendClass() {
      return {
        top: this.position.startsWith('top'),
        bottom: this.position.startsWith('bottom'),
        'float-left': this.position.endsWith('left'),
        'float-right': this.position.endsWith('right'),
      }
    },
    selectedValue() {
      if (!this.metric.data || !this.metric.config) return null;

      const selectedValue = calcValue(this.metric.data, this.metric.config.type, this.store.year, this.selected);
      return prettyNumber(selectedValue, this.metric.config);
    },
    selectedValueRaw() {
      if (!this.metric.data || !this.metric.config || !this.metric.config.raw_label) return null;
      const rawArray = wValsToArray(this.metric.data.map, this.metric.data.w, [this.store.year],
        this.selected);
      let rawValue = sum(rawArray);
      if (this.metric.config.suffix === '%') {
        rawValue /= 100;
      }
      return prettyNumber(rawValue, {prefix: this.metric.config.prefix});
    },
  },
  methods: {
    abbrNumber(value) {
      return legendLabelNumber(value, this.metric.config, false);
    },
    cyclePosition() {
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

#legend.float-left {
  left: 8px;
}

#legend.bottom {
  bottom: 8px;
}

#legend.float-right {
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

.legend--title, .description, .legend, .metricboxes {
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

.legend--title {
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
