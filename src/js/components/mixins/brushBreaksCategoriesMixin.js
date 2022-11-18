import { mainStore } from '@/js/stores/index.js';
import { mapWritableState, mapState } from 'pinia';

export default {
  computed:{
    ...mapState(mainStore, ['metric', 'breaks']),
    ...mapWritableState(mainStore, ['highlight']),
  },
  methods: {
    changeHighlight(n) {
      if (n === -1) {
        this.highlight = [];
      } else {
        this.highlight = this.getBreakIds(n);
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

        if (value !== null && value > this.breaks[n] && value <= this.breaks[n + 1]) {
          ids.push(id.toString());
        }
      });

      return ids;
    },
  }
};
