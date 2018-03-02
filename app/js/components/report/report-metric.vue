<template>
    <div class="row">
        <div class="col-md-12">
    <h3>{{ metric.title }}</h3>
        <table v-if="metricValues" class="table table-striped metric-table">
            <tbody>
            <tr>
            <th class="metric-table__year">Year</th>
            <th class="metric-table__feature-value">Feature Value</th>
            <th class="metric-table__county-average">County Average</th>
            </tr>
            <tr v-for="year in Object.keys(metricValues)">
                <td class="metric-table__year">{{ year }}</td>
                <td class="metric-table__feature-value">{{ prettyValues[year] }}</td>
                <td class="metric-table__county-average"></td>
            </tr>
            </tbody>
        </table>
            <div class="metric-trendchart">
                <TrendChart v-if="metricValues" :metricConfig="metric" :years="Object.keys(metricValues)" :values="Object.values(metricValues)" :selected="[]"/>
            </div>
            <div class="metric-more-info">
                <div class="metric-more-info__title" v-on:click="collapsed = !collapsed"><h3>Why is this important?</h3></div>
                <div class="metric-more-info__body" v-show="!collapsed" v-html="moreInfo"></div>
                </div>
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
        required: false,
      },
    },
    computed: {
      prettyValues: function() {
        let retval = Object.assign(
            ...Object.keys(this.metricValues)
            .map(
                (k) => ({[k]: prettyNumber(this.metricValues[k], this.metric.decimals, this.metric.prefix, this.metric.suffix)})
            )
        );
        console.log(retval);
        return retval;
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
      prettyNumber: function(value) {
        return
      }
    }
  };
</script>

<style scoped>
.metric-more-info {
    background: rgb(204, 204, 204);
}
.metric-more-info__title {
    padding: 3px;
}
.metric-more-info__body {
    background: white;
    border: 3px solid rgb(204,204,204);
    padding: 6px;
}
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