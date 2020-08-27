<template>
  <v-app :style="{ backgroundColor: $vuetify.theme.themes['light'].background }">
    <router-view />
  </v-app>
</template>

<script>

export default {
  name: 'App',
  beforeCreate() {
    // Preload map resources so that they live on even between switching to Report and back.
    // @see https://github.com/mapbox/mapbox-gl-js/pull/9391
    import(/* webpackChunkName: "mapboxgl" */ 'mapbox-gl').then((mapboxgl) => {
      mapboxgl.prewarm();
      import(/* webpackChunkName: "mapboxgl" */ 'mapbox-gl/dist/mapbox-gl.css').then(() => {
        this.$root.mapboxgl = mapboxgl;
      });
    });
  },
};
</script>
