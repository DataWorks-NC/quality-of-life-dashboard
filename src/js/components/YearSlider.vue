<template>
  <div class="flex-item" :style="{flexBasis: `${75*metric.years.length}px`}">
    <!-- eslint-disable vuetify/no-deprecated-props -->
    <v-slider
      v-model="sliderYear"
      min="0"
      :ticks="tickLabels"
      :max="metric.years.length - 1"
      step="1"
      tick-size="2"
      :hint="$t('yearSlider.useSlider')"
      :dense="metric.years.length > 5"
      show-ticks="always"
      thumb-label
    >
      <template #thumb-label="{ modelValue }">
        {{ metric.years[modelValue] }}
      </template>
    </v-slider>
  </div>
</template>

<script>
import { store } from '@/js/stores/compass-store.js';

export default {
  name: 'YearSlider',
  inject: ['metric'],
  data() {
    return {
      store,
    }
  },
  computed: {
    sliderYear: {
      set(tick) {
        this.store.year = this.metric.years[tick];
      },
      get() {
        if (this.store.year) {
          return this.metric.years.indexOf(this.store.year);
        }
        return this.metric.years.length - 1;
      },
    },
    tickLabels() {
      return Object.assign({}, this.metric.years);
    }
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

.v-slider__container .v-slider-track__fill {
  background-color: transparent !important;
}

.v-slider.v-input--horizontal .v-slider-track__tick .v-slider-track__tick-label.v-locale--is-ltr, .v-locale--is-ltr .v-slider.v-input--horizontal .v-slider-track__tick .v-slider-track__tick-label {
  transform: translateY(5px) translateX(-25%) rotate(45deg) !important;
}

/* Make all ticks the same color, otherwise left most (unselected) ones will be a different color */
.v-slider-track__tick.v-slider-track__tick--filled {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>
