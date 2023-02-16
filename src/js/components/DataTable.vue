<template>
  <div v-if="selected.length > 0 && metric.data" id="datatable">
    <div class="tablescroll">
      <v-table class="datatable">
        <thead>
          <tr>
            <th>
              <span :title="$t(`geographies.${geography.id}.description`)" class="tooltip">{{ $t(`geographies.${geography.id}.name`) }}</span>
            </th>
            <th>
              {{ store.year }} {{ $filters.capitalize($t('strings.value')) }} <span v-if="metric.config.label">({{ $t('metricLabels.' + metric.config.label) }})</span>
            </th>
            <th v-if="metric.data.a">
              {{ $filters.capitalize($t('strings.accuracy')) }}
            </th>
            <th v-if="metric.years.length > 1">
              {{ $filters.capitalize($t('strings.trend')) }}<br>{{ trendStartYear }}-{{ trendEndYear }}
            </th>
            <th v-if="metric.config.raw_label">
              {{ $filters.capitalize($t('strings.numberOf')) }} {{ $t('metricLabels.' + metric.config.raw_label) }}
            </th>
            <th v-if="metric.years.length > 1 && metric.config.raw_label">
              {{ $filters.capitalize($t('strings.trend')) }}<br>{{ trendStartYear }}-{{ trendEndYear }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in dataTable" :key="row.geogIndex" @mouseover="highlight([row.geogIndex,])" @mouseout="highlight([])">
            <td>{{ $i18n.locale === 'en' ? geography.label(row.geogIndex) : geography.label_es(row.geogIndex) }}</td>
            <td>{{ row.value }}</td>
            <td v-if="row.accuracy">
              &#177;{{ row.accuracy }}
            </td>
            <td v-if="metric.years.length > 1 && row.trend">
              <v-icon size="14px" :icon="row.trend.icon" />{{ row.trend.label }}
            </td>
            <td v-if="row.rawValue">
              {{ row.rawValue }}
            </td>
            <td v-if="metric.years.length > 1 && row.rawTrend">
              <v-icon size="14px" :icon="row.rawTrend.icon" />{{ row.rawTrend.label }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <p class="text-right">
      <v-btn
        variant="text" href="data.csv" :download="dataFilename" class="download"
        @click="downloadTable('#datatable table')"
      >
        {{ $filters.capitalize($t('strings.download')) }}
      </v-btn>
    </p>
  </div>
</template>

<script>
import { mdiTrendingDown, mdiTrendingNeutral, mdiTrendingUp } from '@mdi/js';
import { store } from '@/js/stores/compass-store.js';
import { isFinite } from 'lodash-es';

import tableToCSV from '../helpers/tableToCSV.js';
import { prettyNumber, round } from '../helpers/numberFormat.js';

export default {
  name: 'DataTable',
  inject: ['selected', 'metric', 'geography'],
  data() { return { mdiTrendingDown, mdiTrendingNeutral, mdiTrendingUp, store };
  },
  computed: {
    // If a year other than the final year is selected, the trend chart shows the trend that year until the present.
    // Otherwise, show the trend over the full length of data we have.
    trendStartYear() {
      if (this.store.year
        === this.metric.years[this.metric.years.length - 1]) return this.metric.years[0];
      return this.store.year;
    },
    trendEndYear() {
      return this.metric.years[this.metric.years.length - 1];
    },
    // Create the formatted data table. Each row is a selected geography.
    dataTable() {
      const trend = (geogIndex) => {
        const begin = this.metric.data.map[geogIndex][`y_${this.trendEndYear}`];
        const end = this.metric.data.map[geogIndex][`y_${this.trendStartYear}`];

        if (isFinite(begin) && isFinite(end)) {
          const trendVal = round(Number(begin), this.metric.config.decimals)
            - round(Number(end), this.metric.config.decimals);
          return {
            icon: this.trendIcon(trendVal),
            label: prettyNumber(trendVal,
              this.metric.config),
          };
        }
        return {
          icon: null,
          label: '--',
        };
      };

      const rawTrend = (geogIndex) => {
        const begin = this.metric.data.map[geogIndex][`y_${this.trendEndYear}`]
          * this.metric.data.w[geogIndex][`y_${this.trendEndYear}`];
        const end = this.metric.data.map[geogIndex][`y_${this.trendStartYear}`]
          * this.metric.data.w[geogIndex][`y_${this.trendStartYear}`];

        if (isFinite(begin) && isFinite(end)) {
          const trendVal = (begin - end) * (this.metric.config.suffix === '%' ? 0.01 : 1);
          return {
            icon: this.trendIcon(trendVal),
            label: prettyNumber(trendVal, {}),
          };
        }
        return {
          icon: null,
          trendVal: '--',
        };
      };

      const rawValue = geogIndex => this.metric.data.w[geogIndex] && prettyNumber(
        this.metric.data.w[geogIndex][`y_${this.store.year}`]
        * this.metric.data.map[geogIndex][`y_${this.store.year}`]
        * (this.metric.config.suffix === '%' ? 0.01 : 1), { prefix: this.metric.config.prefix },
      );

      return this.selected.filter(geogIndex => geogIndex in this.metric.data.map)
      .sort()
      .map(geogIndex => ({
        geogIndex,
        value: prettyNumber(this.metric.data.map[geogIndex][`y_${this.store.year}`],
          this.metric.config),
        accuracy: this.metric.config.accuracy
          && prettyNumber(this.metric.data.a[geogIndex][`y_${this.store.year}`],
            this.metric.config),
        trend: trend(geogIndex),
        rawValue: this.metric.config.raw_label && rawValue(geogIndex),
        rawTrend: this.metric.config.raw_label && this.metric.data.w[geogIndex]
          && rawTrend(geogIndex),
      }));
    },
    dataFilename() {
      let title = this.metric.config.title;
      if (this.$i18n.locale === 'es') {
        title = this.metric.config.title_es;
      }
      return `${title.replaceAll(' ', '_')}.csv`
    },
  },
  methods: {
    // TODO: Switch to using brushBreaksCategories mixin.
    highlight(n) {
      this.store.highlight = n;
    },
    downloadTable(theTable) {
      const csvData = tableToCSV(theTable);
      // i hate you ie
      if (window.navigator.msSaveBlob) {
        const blob = new Blob([csvData], { type: 'application/csv;charset=utf-8;' });
        window.navigator.msSaveBlob(blob, 'data.csv');
      } else {
        document.querySelector('#datatable .download').href = `data:text/csv;charset=utf-8;base64,${btoa(csvData)}`;
      }
    },
    trendIcon(num) {
      if (num === 0) {
        return this.mdiTrendingNeutral;
      } if (num > 0) {
        return this.mdiTrendingUp;
      }
      return this.mdiTrendingDown;
    },
  },
};
</script>

<style lang="css">

    #datatable table {
        width: 100%;
    }

    #datatable tbody tr, #datatable tbody td {
        height: 28px;
        padding: 5px 18px 5px 24px;
    }

    #datatable .tablescroll {
        max-height: 350px;
        max-width: calc(100vw - 56px);
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
