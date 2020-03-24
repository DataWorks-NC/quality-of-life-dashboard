<template lang="html">
  <div class="flex-item" :style="{flexBasis: `${75*metric.years.length}px`}">
    <v-slider
      v-model="year"
      :min="0"
      :max="metric.years.length - 1"
      :tick-labels="metric.years"
      ticks="always"
      :hint="$t('yearSlider.useSlider')"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'YearSlider',
  computed: {
    year: {
      set(tick) {
        this.$store.commit('setYear', this.metric.years[tick]);
      },
      get() {
        return this.metric.years.indexOf(this.$store.state.year);
      },
    },
    ...mapState({
      metric: 'metric',
    }),
  },
};
</script>

<style lang="css">
.v-messages__wrapper {
  text-align: center;
}
.v-input__slot {
  margin-bottom: 1.25em;
}
</style>
