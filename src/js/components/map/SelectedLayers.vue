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
      default: () => {
      },
    },
    colorMap: {
      type: Array,
      default: () => [],
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
  },
  watch: {
    'selected': 'showLayers',
    '$i18n.locale': 'setLabelLanguage',
    'colorMap': 'updateColors',
    'geography.id': 'updateGeography',
  },
  mounted() {
    this.showLayers();
  },
  beforeDestroy() {
    this.hideLayers();
  },
  methods: {
    labelLayer(geography = this.geography.id) {
      return `${geography}-labels`;
    },
    layerNames(geography = this.geography.id) {
      return [
        `${geography}-selected-halo`,
        `${geography}-selected-outline`,
        this.labelLayer(geography),
        `${geography}-selected-fill`];
    },
    showLayers() {
      const map = this.map;

      if (!map) return;

      if (this.selected.length === 0) {
        this.hideLayers();
        return;
      }

      this.log(`Show layers ${this.geography.id}`);

      if (!this.layersLoaded[this.geography.id]) {
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
          }, 'selected_outlines_placeholder');
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
          }, 'selected_outlines_placeholder');
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
          }, 'selected_outlines_placeholder');
        }

        if (!map.getLayer(this.labelLayer())) {
          // Labels
          const BASE_LABEL_SIZE = (this.geography.id === 'tract' && this.selected.length < 3) ? 12 : 8;
          map.addLayer({
            id: this.labelLayer(),
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
      }

      this.layerNames().forEach(layer => {
        map.setLayoutProperty(layer, 'visibility', 'visible');

        if (layer === this.labelLayer()) {
          map.setFilter(layer, this.selectedLabelFilter);
        } else {
          map.setFilter(layer, this.selectedFilter);
        }
      });

      if (this.$route.query.selected && this.$route.query.selected.length > 0 && this.selected.length > 0) {
        map.once('sourcedata', () => {
          this.log('Selected layers loaded');
          this.$emit('layers-loaded');
        });
      }
    },
    hideLayers(geography = this.geography.id) {
      this.log(`Hide layers ${geography}`);
      this.layerNames(geography).forEach(layer => {
        if (this.map.getLayer(layer)) {
          this.map.setLayoutProperty(layer, 'visibility', 'none');
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

      this.log(`Update geography ${oldGeography} => ${newGeography}`);

      this.hideLayers(oldGeography);

      if (!this.map.getSource(newGeography)) {
        this.map.addSource(newGeography, {
          type: 'geojson',
          data: `/data/${newGeography}.geojson.json`,
        });
      }

      this.showLayers();
    },
    setLabelLanguage() {
      if (this.map && this.map.getLayer(this.labelLayer())) {
        this.map.setLayoutProperty(this.labelLayer(), 'text-field',
          this.$i18n.locale === 'es' ? '{label_es}' : '{label}');
      }
    },
  },
};
</script>

<style scoped>

</style>
