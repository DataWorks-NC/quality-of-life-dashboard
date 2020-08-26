<template lang="html">
  <div id="map" />
</template>

<script>
import config from '../../modules/config';

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
    selectGroupName: {
      type: String,
      default: '',
    },
  },
  computed: {
    mapboxgl() {
      return this.$root.mapboxgl;
    },
  },
  watch: {
    '$i18n.locale': 'setLabelLanguage',
  },
  mounted() {
    this.map = this.initMap();
  },
  beforeDestroy() {
    this.map.remove();
  },
  methods: {
    initMap() {
      const { mapConfig } = this;
      const mapOptions = {
        container: 'map',
        // eslint-disable-next-line global-require
        style: require('@/assets/osm-liberty.json'),
        ...mapConfig,
        interactive: false,
        attributionControl: false,
        accessToken: config.privateConfig.mapboxAccessToken,
      };

      const map = new this.mapboxgl.Map(mapOptions);

      // disable map rotation until 3D support added
      // map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      const _this = this;
      // after map initiated, grab geography and initiate/style neighborhoods
      map.once('load', () => {
        const selectedFilter = _this.selectedGeographies.length ? ['in', ['string', ['get', 'id']], ['literal', _this.selectedGeographies]] : ['boolean', true];
        const selectGroupFilter = ['==', ['string', ['get', 'id']], ['literal', _this.selectGroupName]];

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

          if (!_this.selectGroupName) {
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
        }

        if (_this.selectGroupName) {
          map.addSource('selectGroup', {
            type: 'geojson',
            // eslint-disable-next-line global-require
            data: require('@/../data/selectgroups.geojson.json'),
          });

          map.addLayer({
            id: 'selectGroupOutline',
            type: 'line',
            layout: {
              'line-join': 'round',
            },
            paint: {
              'line-blur': 3,
              'line-offset': -3,
              'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 12],
              'line-color': '#F7E55B',
              'line-opacity': 0.9,
            },
            source: 'selectGroup',
            filter: selectGroupFilter,
          });

          // Labels
          const BASE_LABEL_SIZE = 12;
          map.addLayer({
            id: 'selectGroupLabel',
            type: 'symbol',
            source: 'selectGroup',
            layout: {
              'text-font': ['Open Sans Semibold'],
              'text-field': this.$i18n.locale === 'es' ? '{label_es}' : '{label}',
              'text-transform': 'uppercase',
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8,
                BASE_LABEL_SIZE * 0.25,
                9.5,
                BASE_LABEL_SIZE * 0.8,
                10,
                BASE_LABEL_SIZE,
                12,
                BASE_LABEL_SIZE * 2],
              'text-allow-overlap': false,
              'text-justify': 'center',
            },
            paint: {
              'text-halo-color': '#F7E55B',
              'text-halo-width': ['interpolate', ['linear'], ['zoom'], 9, 1, 13, 2],
            },
            filter: selectGroupFilter,
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
        }, 'choropleth_placeholder');

        // Workaround to async issues with map.addLayer vs. map.queryRenderedFeatures
        // @see https://github.com/mapbox/mapbox-gl-js/issues/4222#issuecomment-279446075
        function afterMapRenders() {
          if (!map.loaded()) {
            return;
          }
          let visibleFeatures = false;
          let padding = 50;
          if (map.getLayer('selectGroupOutline')) {
            visibleFeatures = map.queryRenderedFeatures(
              { layers: ['selectGroupOutline'] },
            );
            padding = 100;
          } else if (map.getLayer('neighborhoods-fill-extrude')) {
            visibleFeatures = map.queryRenderedFeatures(
              { layers: ['neighborhoods-fill-extrude'] },
            );
          }
          if (visibleFeatures) {
            const bounds = _this.getBoundingBox(visibleFeatures);
            map.fitBounds(bounds, { padding });
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
