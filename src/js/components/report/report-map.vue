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
  watch: {
    '$i18n.locale': 'setLabelLanguage',
  },
  mounted() {
    this.map = this.initMap();
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
      map.once('load', () => {
        const selectedFilter = _this.selectedGeographies.length ? ['in', ['string', ['get', 'id']], ['literal', _this.selectedGeographies]] : ['boolean', true];
        map.addSource('neighborhoods', {
          type: 'geojson',
          data: `/data/${_this.geographyId}.geojson.json`,
        });

        // Neighborhood boundaries
        // TODO: Is `building` the right layer for this to be before?
        if (_this.selectedGeographies.length) {
          map.addLayer({
            id: 'neighborhoods',
            type: 'line',
            source: 'neighborhoods',
            paint: {
              'line-color': '#00688B',
              'line-width': 2,
              'line-opacity': 0.75,
            },
            filter: selectedFilter,
          });

          map.addLayer({
            id: 'labels',
            type: 'symbol',
            source: 'neighborhoods',
            layout: {
              'text-font': ['Open Sans Semibold'],
              'text-field': _this.$i18n.locale === 'es' ? '{label_es}' : '{label}',
              'text-transform': 'uppercase',
              'text-size': _this.selectedGeographies.length > 3 ? 8 : 12,
              'text-allow-overlap': false,
            },
            paint: {
              'text-halo-color': '#fff',
              'text-halo-width': 2,
            },
            filter: selectedFilter,
          });
        }

        map.addLayer({
          id: 'neighborhoods-fill-extrude',
          type: 'fill-extrusion',
          source: 'neighborhoods',
          paint: {
            'fill-extrusion-opacity': 1,
            'fill-extrusion-color': '#b2f3ed',
          },
          filter: selectedFilter,
        }, 'waterway_river');

        // Workaround to async issues with map.addLayer vs. map.queryRenderedFeatures
        // @see https://github.com/mapbox/mapbox-gl-js/issues/4222#issuecomment-279446075
        function afterMapRenders() {
          if (!map.loaded()) { return; }
          if (map.getLayer('neighborhoods-fill-extrude')) {
            const visibleFeatures = map.queryRenderedFeatures({ layers: ['neighborhoods-fill-extrude'] });
            const bounds = _this.getBoundingBox(visibleFeatures);
            map.fitBounds(bounds, { padding: 50 });
            map.off('render', afterMapRenders);
          }
        }
        map.on('render', afterMapRenders);
      });
      return map;
    },
    getBoundingBox(features) {
      const longitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[0]))), []);
      const latitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[1]))), []);
      return [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]];
    },
    setLabelLanguage() {
      if (this.map && this.map.getLayer('labels')) {
        this.map.setLayoutProperty('labels', 'text-field', this.$i18n.locale === 'es' ? '{label_es}' : '{label}');
      }
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
