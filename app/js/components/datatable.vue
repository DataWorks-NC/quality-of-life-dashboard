<template lang="html">
  <div v-if="selected.length > 0 && metric.data" id="datatable">
    <div class="tablescroll">
      <table class="mdl-data-table mdl-js-data-table datatable">
        <thead>
          <tr>
            <th class="mdl-data-table__cell--non-numeric">
              <span :title="geography.description" class="tooltip">{{ geography.name }}</span>
            </th>
            <th>{{ year }} Value <span v-if="metric.config.label">({{ metric.config.label }})</span>
            </th>
            <th v-if="metric.data.a">Accuracy</th>
            <th v-if="metric.years.length > 1">Trend<br>{{ trendStartYear }}-{{ trendEndYear }}
            </th>
            <th v-if="metric.config.raw_label">Number of {{ metric.config.raw_label }}
            </th>
            <th v-if="metric.years.length > 1 && metric.config.raw_label">Trend<br>{{ trendStartYear }}-{{ trendEndYear }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in dataTable" :key="row.geogIndex" @mouseover="highlight(row.geogIndex)" @mouseout="highlight([])">
            <td class="mdl-data-table__cell--non-numeric">{{ geography.label(row.geogIndex) }}</td>
            <td>{{ row.value }}</td>
            <td v-if="row.accuracy"> &#177; {{ row.accuracy }}</td>
            <td v-if="row.trend" v-html="row.trend"/>
            <td v-if="row.rawValue">{{ row.rawValue }}</td>
            <td v-if="row.rawTrend" v-html="row.rawTrend"/>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mdl-typography--text-right">
      <a download="data.csv" class="mdl-button mdl-js-button mdl-js-ripple-effect download"
         @click="downloadTable('#datatable table')">
        Download
      </a>
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import table2csv from '../modules/table2csv';
import { prettyNumber, round } from '../modules/number_format';
import isNumeric from '../modules/isnumeric';

export default {
  name: 'DataTable',
  computed: mapState({
    metric: 'metric',
    geography: 'geography',
    selected: 'selected',
    curYear: 'year',
    // If a year other than the final year is selected, the trend chart shows the trend that year until the present.
    // Otherwise, show the trend over the full length of data we have.
    trendStartYear(state) {
      if (state.year === state.metric.years[state.metric.years.length - 1]) return state.metric.years[0];
      return state.year;
    },
    trendEndYear(state) {
      return state.metric.years[state.metric.years.length - 1];
    },

    // Create the formatted data table. Each row is a selected geography.
    dataTable(state) {
      const trend = (geogIndex) => {
        const begin = state.metric.data.map[geogIndex][`y_${this.trendEndYear}`];
        const end = state.metric.data.map[geogIndex][`y_${this.trendStartYear}`];

        if (isNumeric(begin) && isNumeric(end)) {
          const trendVal = round(Number(begin), state.metric.config.decimals)
              - round(Number(end), state.metric.config.decimals);
          return `${this.trendIcon(trendVal)} ${prettyNumber(trendVal, state.metric.config.decimals,
            state.metric.config.prefix, state.metric.config.suffix,
            state.metric.config.commas)}`;
        }
        return '--';
      };

      const rawTrend = (geogIndex) => {
        const begin = state.metric.data.map[geogIndex][`y_${this.trendEndYear}`] *
            state.metric.data.w[geogIndex][`y_${this.trendEndYear}`];
        const end = state.metric.data.map[geogIndex][`y_${this.trendStartYear}`] *
            state.metric.data.w[geogIndex][`y_${this.trendStartYear}`];

        if (isNumeric(begin) && isNumeric(end)) {
          const trendVal = (begin - end) * (state.metric.config.suffix === '%' ? 0.01 : 1);
          return `${this.trendIcon(trendVal)} ${prettyNumber(trendVal, 0)}`;
        }
        return '--';
      };

      const rawValue = (geogIndex) => {
        return state.metric.data.w[geogIndex] && prettyNumber(state.metric.data.w[geogIndex][`y_${state.year}`] * state.metric.data.map[geogIndex][`y_${state.year}`] * (state.metric.config.suffix === '%' ? 0.01 : 1), 0, state.metric.config.prefix);
      };

      return state.selected.map(geogIndex => ({
        geogIndex: geogIndex,
        value: prettyNumber(state.metric.data.map[geogIndex][`y_${state.year}`], state.metric.config.decimals, state.metric.config.prefix, state.metric.config.suffix, state.metric.config.commas),
        accuracy: state.metric.config.accuracy && prettyNumber(state.metric.data.a[geogIndex][`y_${state.year}`], state.metric.config.decimals, state.metric.config.prefix, state.metric.config.suffix, state.metric.config.commas),
        trend: trend(geogIndex),
        rawValue: state.metric.config.raw_label && rawValue(geogIndex),
        rawTrend: state.metric.config.raw_label && state.metric.data.w[geogIndex] && rawTrend(geogIndex),
      }));
    },
  }),
  methods: {
    highlight(n) {
      this.$store.commit('setHighlight', n);
    },
    downloadTable(theTable) {
      // TODO: rewrite this?
      const csvData = table2csv(theTable);
      // i hate you ie
      if (window.navigator.msSaveBlob) {
        const blob = new Blob([csvData], { type: 'application/csv;charset=utf-8;' });
        navigator.msSaveBlob(blob, 'data.csv');
      } else {
        document.querySelector('#datatable .download').href = `data:text/csv;charset=utf-8;base64,${btoa(csvData)}`;
      }
    },
    trendIcon(num) {
      if (num === 0) {
        return '<svg class="icon"><use href="#icon-trending_flat"></use></svg>';
      } if (num > 0) {
        return '<svg class="icon"><use href="#icon-trending_up"></use></svg>';
      }
      return '<svg class="icon"><use href="#icon-trending_down"></use></svg>';
    },
  },
};
</script>

<style lang="css">
    #datatable {
        margin: 10px 15px;
    }

    #datatable table {
        width: 100%;
    }

    #datatable tbody tr, #datatable tbody td {
        height: 28px;
        padding: 5px 18px 5px 24px;
    }

    #datatable .tablescroll {
        max-height: 350px;
        overflow: auto;
    }

    #datatable p {
        margin-top: 10px;
    }

    #datatable .tooltip {
        border-bottom: 1px dashed rgba(0, 0, 0, .54);
    }

    #datatable .icon {
        vertical-align: middle;
        width: 24px;
        height: 24px;
    }
    .mdl-data-table th {
        line-height: initial;
    }
</style>
