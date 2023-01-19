import config from '@/js/modules/config.js';
import {gaEvent} from '@/js/modules/tracking.js';
import {fetchResponseJSON, fetchResponseJSONSync} from '@/js/modules/fetch.js';
import {calcValue, sum, wValsToArray} from '@/js/modules/metric_calculations.js';
import jenksBreaks from '@/js/modules/jenksbreaks.js';
import {store} from '@/js/stores/compass-store.js';

export default {
  data() {
    return {
      metric: {
        id: null,
        config: {},
        years: [],
        averageValues: {},
        loaded: false,
      },
      breaks: [],
      store,
    }
  },
  methods: {
    async initFromRoute(metricChanged = true, geographyChanged = true) {
      // TODO: Return if data already loaded.

      // Base metric info.
      const metricId = this.$route.params.metric;

      this.metric.id = metricId;
      this.metric.config = config.dataConfig[`m${metricId}`];

      this.printMode = this.$route.query.mode === 'print';

      // Load metric data.
      if (metricChanged) {
        gaEvent('metric',
          this.metric.config.title.trim(),
          this.metric.config.category.trim());
      }
      if (geographyChanged) {
        this.store.highlight = [];
      }
      if (metricChanged || geographyChanged) {
        await this.loadMetricData();
      }
    },
    async loadMetricData() {
      if (!this.metric.id || !this.geography.id) return;

      const path = `/data/metric/${this.geography.id}/m${this.metric.id}.json`;

      let metricJSON = {};
      if (import.meta.env.SSR) {
        metricJSON = fetchResponseJSONSync(path);
      } else {
        metricJSON = await fetchResponseJSON(path);
      }
      if (!metricJSON) {
        return;
      }

      const nKeys = Object.keys(metricJSON.map);
      const yKeys = Object.keys(metricJSON.map[nKeys[0]]);
      const years = yKeys.map(el => el.replace('y_', ''));

      // drop invalid selected values
      // TODO: is this even needed?
      // const selected = state.selected.filter(id => nKeys.indexOf(id) > 0);
      // if (selected.length !== state.selected.length) {
      //   commit('setSelected', selected);
      // }

      // Calculate average values.
      const keys = Object.keys(metricJSON.map);
      const averageValues = {};
      years.forEach((year) => {
        let areaValue = null;
        let areaValueRaw = null;
        if (this.metric.config.world_val
          && this.metric.config.world_val[`y_${year}`]) {
          areaValue = this.metric.config.world_val[`y_${year}`];
        } else {
          areaValue = calcValue(metricJSON, this.metric.config.type, year, keys);
        }
        if (this.metric.config.raw_label) {
          const rawArray = wValsToArray(metricJSON.map,
            metricJSON.w, [year], keys);
          let rawValue = sum(rawArray);
          if (this.metric.config.suffix === '%') {
            rawValue /= 100;
          }
          areaValueRaw = rawValue;
        }
        averageValues[year] = {value: areaValue, rawValue: areaValueRaw};
      });

      this.metric.years = years;
      this.metric.data = metricJSON;
      this.metric.averageValues = averageValues;
      this.store.year = years[years.length - 1];
      this.breaks = jenksBreaks(metricJSON.map, years, nKeys, 5);
      this.metric.loaded = true;
    },
  }
}
