<template>
    <div class="row" v-if="notNull">
        <div class="col-md-12">
    <h3>{{ metric.title }}</h3>
        <table v-if="metricValues" class="table table-striped metric-table">
            <tbody>
            <tr>
            <th class="metric-table__year">Year</th>
            <th class="metric-table__feature-value">Feature Value</th>
            <th class="metric-table__county-average" v-if="countyAverages">County Average</th>
            </tr>
            <tr v-for="year in years">
                <td class="metric-table__year">{{ year }}</td>
                <td class="metric-table__feature-value">{{ prettify(metricValues[year]) }}</td>
                <td class="metric-table__county-average" v-if="countyAverages">{{ prettify(countyAverages[year]) }}</td>
            </tr>
            </tbody>
        </table>
            <div class="metric-trendchart" v-if="years.length > 1">
                <TrendChart v-if="metricValues && countyAverages"
                            :metricConfig="metric"
                            :years="years"
                            :values="Object.values(metricValues)"
                            :averageValues="Object.values(countyAverages)"
                            :selected="[]"
                />
            </div>
            <div class="metric-more-info">
                <div class="metric-more-info__title" v-on:click="collapsed = !collapsed"><h3>Why is this important?</h3></div>
                <div class="metric-more-info__body" v-show="!collapsed" v-html="moreInfo"></div>
                </div>
            </div>
    </div>
</template>

<script>
  import axios from 'axios';
  import TrendChart from './report-chart.vue';
  import {prettyNumber} from '../../modules/number_format';

  export default {
    name: 'report-metric',
    props: {
      metric: {
        type: Object,
        required: true,
      },
      metricValues: {
        type: Object,
        required: true,
        default: {},
      },
      countyAverages: {
        type: Object,
        required: true,
        default: {},
      }
    },
    computed: {
      years: function() {
        return Object.keys(this.metricValues);
      },
      notNull: function() {
        return (Object.values(this.metricValues).filter((v) => (v !== null)).length > 0)
      }
    },
    components: {
        TrendChart,
    },
    data: function() {
      return {
        collapsed: true,
        moreInfo: 'Loading',
      }
    },
    watch: {
      'collapsed': 'showMoreInfo',
    },
    methods: {
      showMoreInfo: function(collapsed) {
        if (collapsed) return;
        else {
          let _this = this;
          axios.get(`data/meta/m${this.metric.metric}.html`).then(function(data) {
            _this.moreInfo = data.data;
          });
        }
      },
      prettify: function(value) {
        return prettyNumber(value, this.metric.decimals, this.metric.prefix, this.metric.suffix);
      }
    }
  };
</script>
<style>
.metric-more-info__body h2:first-of-type {
    display: none;
}

.metric-more-info__body p:first-of-type {
    display: none;
}

.metric-more-info__body h3:first-of-type {
    display: none;
}
</style>
<style scoped>
td.metric-table__feature-value {
    background-color: #fcf8e3;
}
td.metric-table__selection-average {
    background-color: #dff0d8;
}
td.metric-table__county-average {
    background-color: #f5f5f5;
}

.metric-more-info {
    background: rgb(204, 204, 204);
}
.metric-more-info__title {
    padding: 3px;
    padding-left: 6px;
    color: #337ab7;
    cursor: pointer;
}
.metric-more-info__body {
    background: white;
    border: 3px solid rgb(204,204,204);
    padding: 6px;
}
</style>
