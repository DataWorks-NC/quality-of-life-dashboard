<template lang="html">
  <div class="flex-item" :style="{flexBasis: `${75*metric.years.length}px`}">
    <v-slider
      v-model="year"
      :min="0"
      :max="metric.years.length - 1"
      :tick-labels="$vuetify.breakpoint.name === 'xs' ? [] : metric.years"
      :hint="$t('yearSlider.useSlider')"
      :class="densityClass"
      ticks="always"
      :thumb-label="$vuetify.breakpoint.name === 'xs' ? 'always' : true"
      persistent-hint
    >
      <template #thumb-label="{ value }">
        {{ metric.years[value] }}
      </template>
    </v-slider>
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
    densityClass() {
      return this.metric.years.length > 5 ? 'dense' : '';
    },
  },
};
</script>

<style lang="css">
.v-messages__wrapper {
  text-align: center;
  margin-top: 0.5em;
}
.v-input__slot {
  margin-bottom: 1.25em;
}

.v-application--is-ltr .v-input__slider.dense .v-slider--horizontal .v-slider__tick .v-slider__tick-label, .v-application--is-ltr .v-input__slider.dense .v-slider--horizontal .v-slider__tick:first-child .v-slider__tick-label {
  transform: translateX(-25%) rotate(45deg);
}

.v-application--is-ltr .v-input__slider.dense .v-slider--horizontal .v-slider__tick:last-child .v-slider__tick-label {
  transform: translateY(10%) translateX(-25%) rotate(45deg);
}
</style>
