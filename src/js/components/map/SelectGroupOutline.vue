<template>
  <div />
</template>

<script>
import debugLogMixin from '../mixins/debugLogMixin';
import selectGroups from '@/../data/selectgroups.geojson.json';

export default {
  name: "SelectGroupOutline",
  mixins: [debugLogMixin],
  props: {
    map: {
      type: Object,
      default: () => {
      },
    },
    selectGroupName: {
      type: String,
      default: null,
    },
  },
  data: () => ({
    layersLoaded: {},
  }),
  computed: {
    selectGroupFilter() {
      return ['==', 'id', this.selectGroupName];
    },
    layers() {
      const BASE_LABEL_SIZE = 12;

      return {
        selectGroupLabel: {
          id: 'selectGroupLabel',
          type: 'symbol',
          source: 'selectGroup',
          layout: {
            'text-font': ['Open Sans Semi Bold'],
            'text-field': this.$i18n.locale === 'es' ? '{label_es}' : '{label}',
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
              BASE_LABEL_SIZE * 1.5],
            'text-allow-overlap': false,
            'text-justify': 'center',
          },
          paint: {
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': ['interpolate', ['linear'], ['zoom'], 9, 1, 13, 2],
          },
          filter: this.selectGroupFilter,
        },
        selectGroupOutline: {
          id: 'selectGroupOutline',
          type: 'line',
          source: 'selectGroup',
          paint: {
            'line-color': '#fff',
            'line-width': 2,
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          filter: this.selectGroupFilter,
        },
        selectGroupFill: {
          id: 'selectGroupFill',
          type: 'fill',
          source: 'selectGroup',
          filter: this.selectGroupFilter,
        },
      };
    },
    layerNames() {
      return Object.keys(this.layers);
    },
  },
  watch: {
    'selectGroupName': 'showSelectGroup',
  },
  mounted() {
    this.showSelectGroup(this.selectGroupName, null);
  },
  beforeUnmount() {
    if (this.map) {
      this.hideSelectGroup();
    }
  },
  methods: {
    hideSelectGroup() {
      this.layerNames.forEach(name => {
        if (this.map.getLayer(name)) {
          this.map.setLayoutProperty(name, 'visibility', 'none');
        }
      });
    },
    showSelectGroup(newName, oldName) {
      if ((!newName && !oldName) || (newName === oldName)) return;

      const map = this.map;
      this.log(`Show selectGroup ${oldName} => ${newName}`);

      if (!newName) {
        this.hideSelectGroup();
        return;
      }

      // TODO: Is this potentially faster if we split up the selectgroups geoJSON file
      //  into separate files for each selectGroup?
      if (!map.getSource('selectGroup')) {
        map.addSource('selectGroup', {
          type: 'geojson',
          promoteId: 'id',
          data: selectGroups,
        });
      }

      this.layerNames.forEach(name => {
        if (!map.getLayer(name)) {
          if (name === 'selectGroupLabel') {
            map.addLayer(this.layers[name]);
          } else {
            map.addLayer(this.layers[name], 'neighborhood_outline_placeholder');
          }

          // Need to handle crosshatch fill separately.
          if (name === 'selectGroupFill') {
            if (!map.hasImage('crosshatch')) {
              map.loadImage(
                '/img/crosshatch_pattern.png',
                (err, image) => {
                  if (!err) {
                    map.addImage('crosshatch', image);
                    map.setPaintProperty('selectGroupFill', 'fill-pattern', 'crosshatch');
                  } else if (this.debug) {
                    this.log(err);
                  }
                },
              );
            } else {
              map.setPaintProperty('selectGroupOutline', 'fill-pattern', 'crosshatch');
            }
          }
        } else {
          map.setFilter(name, this.selectGroupFilter);
          map.setLayoutProperty(name, 'visibility', 'visible');
        }
      });

      map.once('sourcedata', () => {
        this.log('Selectgroup layers loaded');
        this.$emit('layers-loaded');
      });
    },
  },
};
</script>

<style scoped>

</style>
