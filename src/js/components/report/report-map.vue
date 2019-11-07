<template lang="html">
  <div id="map" />
</template>

<script>
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  name: 'ReportMap',
  props: {
    mapConfig: {
      type: Object,
      required: true,
    },
    geographyId: {
      type: String,
      required: true,
    },
    selectedGeographies: {
      type: Array,
      default: () => [],
    },
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      const { mapConfig } = this;
      const mapOptions = {
        container: 'map',
        interactive: false,
        style: mapConfig.style,
        attributionControl: false,
        zoom: mapConfig.zoom,
        center: mapConfig.center,
        maxBounds: mapConfig.maxBounds,
        minZoom: mapConfig.minZoom,
      };

      const map = new mapboxgl.Map(mapOptions);

      // disable map rotation until 3D support added
      // map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      const _this = this;
      // after map initiated, grab geography and initiate/style neighborhoods
      map.once('style.load', () => {
        map.addSource('neighborhoods', {
          type: 'geojson',
          data: `/data/${_this.geographyId}.geojson.json`,
        });

        // neighborhood boundaries
        // TODO: Is `building` the right layer for this to be before?
        map.addLayer({
          id: 'neighborhoods',
          type: 'line',
          source: 'neighborhoods',
          filter: ['match', ['get', 'id'], _this.selectedGeographies, true, false],
        }, 'tunnel_motorway_link_casing');

        map.addLayer({
          id: 'neighborhoods-fill-extrude',
          type: 'fill-extrusion',
          source: 'neighborhoods',
          paint: {
            'fill-extrusion-opacity': 1,
          },
          filter: ['match', ['get', 'id'], _this.selectedGeographies, true, false],
        }, 'waterway_river');
        if (map.getLayer('neighborhoods')) {
          map.setPaintProperty('neighborhoods', 'line-color', '#00688B');
          map.setPaintProperty('neighborhoods', 'line-width', 2);
        }
        if (map.getLayer('neighborhoods-fill-extrude')) {
          map.setPaintProperty('neighborhoods-fill-extrude', 'fill-extrusion-color', '#b2f3ed');
        }

        // Workaround to async issues with map.addLayer vs. map.queryRenderedFeatures
        // @see https://github.com/mapbox/mapbox-gl-js/issues/4222#issuecomment-279446075
        function afterMapRenders() {
          if (!map.loaded()) { return; }

          const visibleFeatures = map.queryRenderedFeatures({ layers: ['neighborhoods'] });
          const bounds = _this.getBoundingBox(visibleFeatures);
          map.fitBounds(bounds, { padding: 50 });
          map.off('render', afterMapRenders);
        }

        map.on('render', afterMapRenders);
      });
    },
    getBoundingBox(features) {
      const longitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[0]))), []);
      const latitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[1]))), []);
      return [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]];
    },
  },
};

</script>

<style lang="scss" scoped>
#map {
  height: 400px;

  @media (max-width: 767px) {
    width: 100%;
  }
}
</style>
