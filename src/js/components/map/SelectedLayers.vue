<template>
  <div />
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import debugLogMixin from '../mixins/debugLogMixin';

export default {
  name: "SelectedLayers",
  mixins: [debugLogMixin],
  props: {
    map: {
      type: Object,
      default: () => {},
    },
    colorMap: {
      type: Array,
      default: () => [],
    },
    mapConfig: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    layersLoaded: {},
  }),
  computed: {
    ...mapState(
      ['geography'],
    ),
    ...mapGetters(['selected', 'selectGroupName', 'selectGroupType']),
    selectedToLabel() {
      if (this.selectGroupName && this.selectGroupType) return [];
      return this.selected;
    },
    selectedFilter() {
      return ['in', ['string', ['get', 'id']], ['literal', this.selected]];
    },
    selectedLabelFilter() {
      return ['in', ['string', ['get', 'id']], ['literal', this.selectedToLabel]];
    },
    labelLayer() {
      return `${this.geography.id}-labels`;
    },
    layerNames() {
      return [`${this.geography.id}-selected-halo`, `${this.geography.id}-selected-outline`, this.labelLayer, `${this.geography.id}-selected-fill`];
    },
  },
  watch: {
    'selected': 'redrawLayers',
    '$i18n.locale': 'setLabelLanguage',
    'colorMap': 'updateColors',
    'geography.id': 'updateGeography',
  },
  mounted() {
    this.initLayers();
  },
  beforeDestroy() {
    this.hideLayers();
  },
  methods: {
    initLayers() {
      const map = this.map;

      if (!map || !this.selected || !this.selected.length) return;

      this.log(`Init layers ${this.geography.id}`);

      if (!map.getLayer(`${this.geography.id}-selected-halo`)) {
        // Outlines selected tracts/blockgroups with a wider/brighter halo.
        map.addLayer({
          id: `${this.geography.id}-selected-halo`,
          type: 'line',
          source: this.geography.id,
          filter: this.selectedFilter,
          layout: {
            'line-join': 'round',
          },
          paint: {
            'line-blur': 3,
            'line-offset': -3,
            'line-width': 8,
            'line-color': '#D996FF',
          },
        }, this.mapConfig.neighborhoodsBefore);
      }

      if (!map.getLayer(`${this.geography.id}-selected-outline`)) {
        // Dark purple outline layer selected tracts/blockgroups only.
        map.addLayer({
          id: `${this.geography.id}-selected-outline`,
          filter: this.selectedFilter,
          type: 'line',
          layout: {
            'line-join': 'round',
          },
          paint: {
            'line-width': 3,
            'line-color': '#68089e',
          },
          source: this.geography.id,
        }, this.mapConfig.threeDBefore);
      }

      if (!map.getLayer(`${this.geography.id}-selected-fill`)) {
        // Choropleth fill layer selected tracts/blockgroups only.
        map.addLayer({
          id: `${this.geography.id}-selected-fill`,
          filter: this.selectedFilter,
          type: 'fill',
          paint: {
            'fill-outline-color': '#68089e',
            'fill-color': this.colorMap,
          },
          source: this.geography.id,
        }, this.mapConfig.neighborhoodsBefore);
      }

      if (!map.getLayer(this.labelLayer)) {
        // Labels
        const BASE_LABEL_SIZE = (this.geography.id === 'tract' && this.selected.length < 3) ? 12 : 8;
        map.addLayer({
          id: this.labelLayer,
          type: 'symbol',
          source: this.geography.id,
          layout: {
            'text-font': ['Open Sans Semibold'],
            'text-field': this.$i18n.locale === 'es' ? '{label_es}' : '{label}',
            'text-transform': 'uppercase',
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              BASE_LABEL_SIZE * 0.5,
              9.5,
              BASE_LABEL_SIZE * 0.8,
              10,
              BASE_LABEL_SIZE,
              12,
              BASE_LABEL_SIZE * 2],
            'text-allow-overlap': false,
          },
          paint: {
            'text-halo-color': '#fff',
            'text-halo-width': ['interpolate', ['linear'], ['zoom'], 9, 1, 13, 2],
          },
          filter: this.selectedLabelFilter,
        });
      }

      this.layersLoaded[this.geography.id] = true;
    },
    hideLayers() {
      if (this.layersLoaded[this.geography.id]) {
        this.layerNames.forEach(layer => {
          this.map.setLayoutProperty(layer, 'visibility', 'none');
        });
      }
    },
    redrawLayers() {
      const map = this.map;

      if (!map) return;

      this.log('Redraw selected layers');

      if (!this.selected.length) {
        this.hideLayers();
        return;
      }

      if (!this.layersLoaded[this.geography.id]) {
        this.initLayers();
      }

      this.layerNames.forEach(layer => {
        map.setLayoutProperty(layer, 'visibility', 'visible');

        if (layer === this.labelLayer) {
          map.setFilter(layer, this.selectedLabelFilter);
        } else {
          map.setFilter(layer, this.selectedFilter);
        }
      });
    },
    updateColors() {
      if (this.map.getLayer(`${this.geography.id}-selected-fill`)) {
        this.map.setPaintProperty(`${this.geography.id}-selected-fill`, 'fill-color', this.colorMap);
      }
    },
    updateGeography(newGeography, oldGeography) {
      if (!newGeography) return;

      const oldMapLayers = [`${oldGeography}-selected-halo`, `${oldGeography}-selected-outline`, `${oldGeography}-selected-fill`, `${oldGeography}-labels`];
      const newMapLayers = [`${newGeography}-selected-halo`, `${newGeography}-selected-outline`, `${newGeography}-selected-fill`, `${newGeography}-labels`];

      if (this.layersLoaded[oldGeography]) {
        oldMapLayers.forEach((layer) => {
          this.map.setLayoutProperty(layer, 'visibility', 'none');
        });
      }

      if (!this.map.getSource(newGeography)) {
        this.map.addSource(newGeography, {
          type: 'geojson',
          data: `/data/${newGeography}.geojson.json`,
        });
      }

      if (!this.layersLoaded[newGeography]) {
        this.initLayers();
      }

      if (this.layersLoaded[newGeography]) {
        newMapLayers.forEach((layer) => {
          this.map.setLayoutProperty(layer, 'visibility', 'visible');
        });
      }
    },
    setLabelLanguage() {
      if (this.map && this.map.getLayer(this.labelLayer)) {
        this.map.setLayoutProperty(this.labelLayer, 'text-field', this.$i18n.locale === 'es' ? '{label_es}' : '{label}');
      }
    },
  },
};
</script>

<style scoped>

</style>
