<template>
  <div :style="`min-height:${minHeight}px;`">
    <slot v-if="mapboxglLoaded" />
    <slot v-else name="placeholder">
      <div style="width: 600px; height:600px;" />
    </slot>
  </div>
</template>

<script>
import {computed} from 'vue';

export default {
  name: 'MapboxProvider',
  provide() {
    return {
      mapboxglLoaded: computed(() => this.mapboxglLoaded),
      mapboxgl: computed(() => this.mapboxgl),
    };
  },
  props: {
    minHeight: {
      type: Number,
      default: 600,
    }
  },
    data() {
    return {
      mapboxglLoaded: false,
      mapboxgl: null,
    };
  },
  async mounted() {
    if (!import.meta.env.SSR) {
      const mapboxgl = await import('mapbox-gl');
      if (!mapboxgl || !mapboxgl.prewarm) {
        return;
      }
      mapboxgl.prewarm();
      this.mapboxglLoaded = true;
      this.mapboxgl = mapboxgl;
    }
  },
};
</script>

<style>
</style>
