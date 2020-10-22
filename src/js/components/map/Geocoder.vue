<template>
  <div />
</template>

<script>
import { uniqBy } from 'lodash';

import MapboxGlGeocoder from '@mapbox/mapbox-gl-geocoder';
import { mapGetters, mapState } from 'vuex';

import debugLogMixin from '../mixins/debugLogMixin';
import config from '../../modules/config';

import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

export default {
  name: 'Geocoder',
  mixins: [debugLogMixin],
  props: {
    map: {
      type: Object,
      default: () => {
      },
    },
  },
  data() {
    return {
      selectGroupsData: config.selectGroups,
    };
  },
  computed: {
    ...mapState(
      ['geography'],
    ),
    ...mapGetters(['selected']),
    mapboxgl() {
      return this.$root.mapboxgl;
    },
    selectGroups() {
      const categories = Object.keys(this.selectGroupsData);
      const selectGroups = {};
      categories.forEach(c => {
        if (!this.geography.id || !(this.geography.id in this.selectGroupsData[c])) return;
        Object.keys(this.selectGroupsData[c][this.geography.id]).forEach(selectGroupName => {
          selectGroups[`${selectGroupName}, ${c}`] = {
            selectGroupName,
            selectGroupType: c,
            ids: this.selectGroupsData[c][this.geography.id][selectGroupName],
          };
        });
      });
      return selectGroups;
    },
  },
  watch: {
    'selected': 'clearGeocoder',
  },
  mounted() {
    this.geocoder = null;
    this.addressMarker = null;
    this.initGeocoder();
  },
  beforeDestroy() {
    if (this.map) {
      this.map.removeControl(this.geocoder);
    }
  },
  methods: {
    initGeocoder() {
      const map = this.map;
      const _this = this;

      this.addressPopup = new this.mapboxgl.Popup({
        closeButton: false,
        anchor: 'bottom-left',
        className: 'address_popup',
      });

      this.addressMarker = new this.mapboxgl.Marker({
        color: '#db3360',
      }).setPopup(this.addressPopup);

      this.geocoder = new MapboxGlGeocoder({
        accessToken: config.privateConfig.mapboxAccessToken,
        localGeocoder: this.localGeocoder,
        country: 'us',
        bbox: [-79.01, 35.87, -78.7, 36.15],
        placeholder: this.$t('map.SearchPlaceholder'),
        zoom: 14,
        marker: false,
        flyTo: true,
        types: "address,poi", // see https://docs.mapbox.com/api/search/#data-types for full list.
        mapboxgl: this.mapboxgl,
      }).on('result', (e) => {
        _this.addressMarker.remove();

        if (e.result) {
          _this.log(e.result);

          // Handle results differently depending on the type of result.
          // Case 1: This is a Mapbox geocoded address
          if (!('local_match' in e.result)) {
            // Add popup marker to address.
            _this.addressPopup.setText(
              e.result.place_name.replace('North Carolina ', '').replace(', United States of America', ''),
            );
            _this.addressMarker.setLngLat(e.result.center).addTo(map).togglePopup();

            // We need to first move map to the marker and *then* select the visible features under that marker.
            // TODO: Tweak these animations to make the UI more seamless.
            map.flyTo({ center: e.result.center }, { flyToMarker: true, center: e.result.center });

            map.once('moveend', (moveEvent) => {
              // Once animation has finished, now the features will be visible.
              if (!moveEvent.flyToMarker) return;
              // Clear selection and select underlying area. Remove duplicates by casting to Set.
              const features = Array.from(
                new Set(
                  map.queryRenderedFeatures(
                    map.project(moveEvent.center),
                    { layers: [`${_this.geography.id}-fill`] },
                  ).map(g => g.properties.id),
                ),
              );

              _this.$router.push({ query: { ..._this.$route.query, selected: features } });
            });
            // eslint-disable-next-line brace-style
          }

          // Case 2: This is an existing feature on the map.
          else if (e.result.local_match === 'feature') {
            _this.$router.push({ query: { ..._this.$route.query, selected: [e.result.properties.id] } });
            // eslint-disable-next-line brace-style
          }

          // Case 3: This is a select group.
          else if (e.result.local_match === 'selectGroup') {
            _this.$router.push({
              query: {
                ...this.$route.query,
                selected: [],
                selectGroupName: e.result.selectGroupName,
                selectGroupType: e.result.selectGroupType,
              },
            });
          }
        }
      }).on('clear', () => {
        if (_this.addressMarker) {
          if (_this.addressPopup.isOpen()) _this.addressMarker.togglePopup();
          _this.addressMarker.remove();
        }
        if (_this.map.getLayer('point')) {
          _this.map.getSource('point').setData({
            "type": "FeatureCollection",
            "features": [],
          });
        }
      });
      map.addControl(this.geocoder, 'bottom-right');
    },
    localGeocoder(searchString) {
      const searchStringDownCase = searchString.toLowerCase();
      // Query map layers by name.
      const matchingFeatures = uniqBy(this.map.querySourceFeatures(this.geography.id, {
        filter: ['in', searchStringDownCase, ['downcase', ['get', 'label']]],
      }), f => f.properties.id).map(f => ({
        ...f, place_name: f.properties.label, place_type: ["place"], local_match: 'feature',
      }));

      // Query select groups.
      const matchingSelectGroups = Object.keys(this.selectGroups)
        .filter(n => n.toLowerCase().includes(searchStringDownCase))
        .map(match => ({
          place_name: match, place_type: ["place"], local_match: 'selectGroup', ...this.selectGroups[match],
        }));

      return matchingFeatures.concat(matchingSelectGroups);
    },
    clearGeocoder() {
      // Clear the pin that gets dropped on address search when user clears selection.
      if (this.selected && !this.selected.length && this.geocoder) {
        this.log('Clear geocoder');
        this.geocoder.clear();
      }
    },
  },
};
</script>

<style lang="scss">
.mapboxgl-ctrl-geocoder input[type="text"] {
  color: rgba(0, 0, 0, 0.8);
}

.mapboxgl-popup {
  max-width: 400px;
}

.mapboxgl-popup-content {
  padding: 10px 10px 5px;
}

.address_popup {
  color: white;

  .mapboxgl-popup-tip {
    border-top-color: #db3360;
  }

  .mapboxgl-popup-content {
    background-color: #db3360;
    font-weight: bold;
    padding: 10px;
    font-size: 12px;
    line-height: 12px;
  }
}

.hover_popup {
  z-index: 1000;
}
</style>
