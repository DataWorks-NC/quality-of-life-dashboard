<template lang="html">
  <div class="map-container">
    <div class="" style="position: relative; width: 100%; height: 100%">
      <div id="map" />
      <selected-layers v-if="mapLoaded && selected.length" :color-map="colorMap" :map="map" :map-config="mapConfig" />
      <select-group-outline v-if="mapLoaded && selectGroupName" :map="map" :map-config="mapConfig" :select-group-name="selectGroupName" />
    </div>
    <dashboard-legend />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { uniqBy } from 'lodash';

import mapboxgl from 'mapbox-gl';
import MapboxGlGeocoder from '@mapbox/mapbox-gl-geocoder';
import { prettyNumber } from '../../modules/number_format';
import FullExtent from '../../modules/map-fullextent';
import config from '../../modules/config';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import DashboardLegend from "../dashboard-legend.vue";
import SelectedLayers from './SelectedLayers.vue';
import SelectGroupOutline from './SelectGroupOutline.vue';

import debugLogMixin from '../mixins/debugLogMixin';

export default {
  // You would think to just name this component 'Map', but <map> is in the HTML5 spec!
  name: 'MapContainer',
  components: {
    SelectedLayers,
    DashboardLegend,
    SelectGroupOutline,
  },
  mixins: [debugLogMixin],
  props: {
    mapboxAccessToken: {
      type: String,
      required: true,
    },
    mapConfig: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      locationPopup: null,
      mapLoaded: false,
      map: null,
      colors: config.colors,
      selectGroupsData: config.selectGroups,
    };
  },

  computed: {
    ...mapState(
      ['breaks', 'geography', 'highlight', 'metric', 'metricId', 'printMode', 'year'],
    ),
    ...mapGetters(['selected', 'selectGroupName', 'selectGroupType']),
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
    metricData() {
      if (this.metric) {
        return this.metric.data;
      }
      return {};
    },

    // Returns a Mapbox GL Expression assigning tract/blockgroup values to the color which matches their metric value
    // using this.colors and this.breaks to set colors and break values. Also highlights tracts/blockgroups in yellow
    // when their IDs are in this.highlight.
    colorMap() {
      if (!this.metricData) return;

      // Array of arrays of IDs. Places 0-4 correspond to choropleth colors 1-5 and place 5 corresponds to highlight.
      const stops = [[], [], [], [], [], []];

      const { breaks, colors } = this;

      const getStop = (val) => {
        if (val <= breaks[1]) {
          return 0;
        } if (val <= breaks[2]) {
          return 1;
        } if (val <= breaks[3]) {
          return 2;
        } if (val <= breaks[4]) {
          return 3;
        } if (val <= breaks[5]) {
          return 4;
        }
      };

      Object.keys(this.metricData.map).forEach((id) => {
        const value = this.metricData.map[id][`y_${this.year}`];
        if (this.highlight.indexOf(id) !== -1) {
          stops[5].push(id);
        } else if (value !== null) {
          stops[getStop(value)].push(id);
        }
      });

      const returnExpression = ['case'];
      colors.forEach((color, idx) => {
        returnExpression.push(['in', ['string', ['get', 'id']], ['literal', stops[idx]]]);
        returnExpression.push(color);
      });

      returnExpression.push(['in', ['string', ['get', 'id']], ['literal', stops[5]]]);
      returnExpression.push('#F7E55B');
      returnExpression.push(['rgb', 242, 243, 240]);

      return returnExpression;
    },
  },

  watch: {
    'selected': ['clearGeocoder', 'rescale'],
    'colorMap': 'updateChoroplethColors',
    'selectGroupName': 'rescale',
    'highlight': 'updateChoroplethColors',
    'geography.id': 'updateGeography',
  },
  mounted() {
    // Add these at mount time because they should not be reactive properties (don't want
    // component to update each time they change).
    this.geocoder = null;
    this.addressMarker = null;
    this.hoverPopup = null;
    this.initMap();
    this.initGeocoder();
  },
  methods: {
    initMap() {
      const mapOptions = {
        container: 'map',
        attributionControl: false,
        ...this.mapConfig,
      };
      this.map = new mapboxgl.Map(mapOptions);

      const _this = this;
      const { map } = _this;
      mapboxgl.accessToken = _this.mapboxAccessToken;

      this.addressPopup = new mapboxgl.Popup({
        closeButton: false,
        anchor: 'bottom-left',
        className: 'address_popup',
      });

      this.addressMarker = new mapboxgl.Marker({
        color: '#db3360',
      }).setPopup(this.addressPopup);

      this.hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'hover_popup',
      });

      // Zoom to county extent initially before map loads.
      this.zoomToFullExtent();

      // add nav control
      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav, 'top-right');

      // add full extent button
      map.addControl(new FullExtent(
        mapOptions.center,
        mapOptions.zoom,
      ), 'top-right');
      map.addControl(new mapboxgl.GeolocateControl(), 'top-right');

      if (this.debug) {
        map.on('zoomend', () => {
          this.log(`Zoom: ${map.getZoom()}`);
        });
      }

      // Disable map rotation.
      map.touchZoomRotate.disableRotation();

      // after map initiated, grab geography and initiate/style neighborhoods
      map.once('load', () => {
        this.log('Map load');
        // Add tracts
        map.addSource(_this.geography.id, {
          type: 'geojson',
          data: `/data/${_this.geography.id}.geojson.json`,
        });

        _this.mapLoaded = true;
        _this.initChoroplethLayer();
        _this.updateChoroplethColors();
        // _this.showSelectGroup(_this.selectGroupName);
        _this.initMapEvents();
        if (_this.selected) {
          // QueryRenderedFeatures doesn't seem to work until even after map has loaded styles :/
          setTimeout(() => { _this.rescale(); }, 2500);
        }
      });
    },
    initChoroplethLayer() {
      const { map } = this;

      // Choropleth fill layer for all tracts/blockgroups.
      map.addLayer({
        'id': `${this.geography.id}-fill`,
        'type': 'fill',
        'source': this.geography.id,
        'paint': {
          'fill-color': this.colorMap,
          'fill-outline-color': 'rgba(0,0,0,1)',
        },
      }, this.mapConfig.neighborhoodsBefore);
    },
    initGeocoder() {
      if (this.printMode) return;

      const map = this.map;
      const _this = this;
      this.geocoder = new MapboxGlGeocoder({
        accessToken: this.mapboxAccessToken,
        localGeocoder: this.localGeocoder,
        country: 'us',
        bbox: [-79.01, 35.87, -78.7, 36.15],
        placeholder: this.$t('map.SearchPlaceholder'),
        zoom: 14,
        marker: false,
        flyTo: true,
        types: "address,poi", // see https://docs.mapbox.com/api/search/#data-types for full list.
        mapboxgl,
      }).on('result', (e) => {
        _this.addressMarker.remove();

        if (e.result) {
          // Handle results differently depending on the type of result.
          // Case 1: This is a Mapbox geocoded address
          if (!('local_match' in e.result)) {
            // Add popup marker to address.
            _this.addressPopup.setText(e.result.place_name.replace('North Carolina ', '').replace(', United States of America', ''));
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
              _this.zoomToIds(features);
            });
            // eslint-disable-next-line brace-style
          }

          // Case 2: This is an existing feature on the map.
          else if (e.result.local_match === 'feature') {
            _this.$router.push({ query: { ...this.$route.query, selected: [e.result.id] } });
            _this.zoomToIds(e.result.id);
            // eslint-disable-next-line brace-style
          }

          // Case 3: This is a select group.
          else if (e.result.local_match === 'selectGroup') {
            _this.$router.push({
              query: {
                ...this.$route.query, selected: [], selectGroupName: e.result.selectGroupName, selectGroupType: e.result.selectGroupType,
              },
            });
            _this.zoomToSelectGroup(e.result.selectGroupName);
          }
        }
      }).on('clear', () => {
        if (_this.addressMarker) {
          if (_this.addressPopup.isOpen()) _this.addressMarker.togglePopup();
          _this.addressMarker.remove();
        }
        if (map.getLayer('point')) {
          map.getSource('point').setData({
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
      const matchingSelectGroups = Object.keys(this.selectGroups).filter(n => n.toLowerCase().includes(searchStringDownCase)).map(match => ({
        place_name: match, place_type: ["place"], local_match: 'selectGroup', ...this.selectGroups[match],
      }));

      return matchingFeatures.concat(matchingSelectGroups);
    },
    initMapEvents() {
      const { map } = this;
      const _this = this;

      // on feature click add or remove from selected set
      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [`${_this.geography.id}-fill`] }).filter(f => _this.metric.data.map[f.properties.id][`y_${_this.year}`] !== null); // Only allow select when metric value is not null;
        if (!features.length) {
          return;
        }

        const feature = features[0];
        const featureIndex = _this.selected.indexOf(feature.properties.id);

        if (featureIndex === -1) {
          _this.addToSelected(feature.properties.id);
        } else {
          _this.removeFromSelected(feature.properties.id);
        }
      });

      // fix for popup cancelling click event on iOS
      // TODO: evaluate if necessary
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (!iOS) {
        map.on('mouseleave', `${this.geography.id}-fill`, () => {
          _this.hoverPopup.remove();
        });

        // show feature info on mouse move
        map.on('mousemove', (e) => {
          if (!_this.metric.config || !_this.metric.data) {
            return;
          }
          const features = map.queryRenderedFeatures(e.point, { layers: [`${_this.geography.id}-fill`] })
            .filter(f => f.properties.id in _this.metric.data.map && _this.metric.data.map[f.properties.id][`y_${_this.year}`] !== null); // Only show popup when metric value is not null

          if (!features.length) {
            _this.hoverPopup.remove();
            map.getCanvas().style.cursor = '';
            return;
          }

          map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

          const feature = features[0];
          const { id } = feature.properties;
          const data = _this.metric.data.map[id][`y_${_this.year}`];
          const geographyLabel = _this.$i18n.locale === 'es' ? feature.properties.label_es : feature.properties.label;
          const val = prettyNumber(data, _this.metric.config.decimals, _this.metric.config.prefix,
            _this.metric.config.suffix, _this.metric.config.commas);
          const label = _this.metric.config.label ? ` ${_this.$t(`metricLabels.${_this.metric.config.label}`)}` : '';
          _this.hoverPopup.setLngLat(map.unproject(e.point))
            .setHTML(
              `<div style="text-align:center; margin:0; padding:0;"><h3 style="font-size:1.2em; margin:0; padding:0; line-height:1em; font-weight:bold;">${geographyLabel}</h3>${val}${label}</div>`,
            )
            .addTo(map);
        });
      }
    },
    clearGeocoder() {
      // Clear the pin that gets dropped on address search when user clears selection.
      if (!this.selected.length && this.geocoder) {
        this.geocoder.clear();
      }
    },
    updateChoropleth() {
      if (this.mapLoaded) {
        this.updateChoroplethColors();
      }
    },
    updateGeography(newGeography, oldGeography) {
      if (!this.geography.id) return;

      this.log(`updateGeography ${oldGeography} => ${newGeography}`);

      const oldMapLayers = [`${oldGeography}-fill`];

      const newMapLayers = [`${newGeography}-fill`];

      if (!this.map.getSource(newGeography)) {
        this.log(`Add source: ${newGeography}`);
        this.map.addSource(newGeography, {
          type: 'geojson',
          data: `/data/${newGeography}.geojson.json`,
        });
      }

      oldMapLayers.forEach((layer) => {
        if (this.map.getLayer(layer)) {
          this.map.setLayoutProperty(layer, 'visibility', 'none');
        }
      });

      newMapLayers.forEach((layer) => {
        if (!this.map.getLayer(layer)) {
          // TODO: Move this out of the loop.
          this.initChoroplethLayer();
        } else {
          this.map.setLayoutProperty(layer, 'visibility', 'visible');
        }
      });
    },
    rescale(oldSelected = null) {
      try {
        if (this.$route.query.selected && this.$route.query.selected.length && this.selected.length) {
          return this.zoomToIds(this.selected);
        }
        if (this.selectGroupName) {
          return this.zoomToSelectGroup(this.selectGroupName);
        }
        if (!oldSelected) {
          // Only zoom to full extent if you did not just deselect.
          return this.zoomToFullExtent();
        }
      } catch (e) {
        if (this.debug) {
          console.error(e);
        }
        return null;
      }
    },
    zoomToFullExtent() {
      const durhamCountyBounds = [-79.0182952880858949, 35.8613166809082031, -78.6963348388672017, 36.2414207458496023];
      this.map.fitBounds(durhamCountyBounds, { padding: 50 });
      return durhamCountyBounds;
    },
    zoomToIds(ids, recurse = true) {
      this.log(`Zoom to ids ${ids}`);
      const zoomToFeatures = this.map.querySourceFeatures(this.geography.id, { filter: ['match', ['get', 'id'], ids, true, false] });
      if (!zoomToFeatures.length) {
        // Workaround for https://github.com/mapbox/mapbox-gl-js/issues/5686. Fly to full extent so all features are
        // visible if the features weren't initially found.
        if (recurse) {
          this.zoomToFullExtent();
          this.map.once('moveend', () => {
            this.zoomToIds(ids, false);
          });
          return;
        }
      }
      const bounds = this.getBoundingBox(zoomToFeatures);
      this.map.fitBounds(bounds, { padding: 150 });
      return bounds;
    },
    // TODO: Move this to SelectGroupOUtline component and communicate via an event.
    zoomToSelectGroup(id, recurse = true) {
      const zoomToFeatures = this.map.querySourceFeatures('selectGroup', { filter: ['==', 'id', id] });
      this.log(`Zoom to selectgroup ${id}`);

      if (!zoomToFeatures.length) {
        this.log(`Source selectgroup feature ${id} not found`);
        if (recurse) {
          // Workaround for https://github.com/mapbox/mapbox-gl-js/issues/5686. Fly to full extent so all features are
          // visible if the feature wasn't initially found.
          this.zoomToFullExtent();
          this.map.once('moveend', () => {
            this.zoomToSelectGroup(id, false);
          });
        }
        return;
      }
      const bounds = this.getBoundingBox(zoomToFeatures);
      this.map.fitBounds(bounds, { padding: 150 });

      return bounds;
    },
    getBoundingBox(features) {
      const longitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[0]))), []);
      const latitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[1]))), []);
      return [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]];
    },
    addToSelected(featureId) {
      const query = { ...this.$route.query, selected: this.selected.concat(featureId) };
      this.$router.push({ query });
    },
    removeFromSelected(featureId) {
      const i = this.selected.indexOf(featureId);
      if (i !== -1) {
        const query = { ...this.$route.query, selected: this.selected.slice(0, i).concat(this.selected.slice(i + 1)) };
        this.$router.push({ query });
      }
    },
    updateChoroplethColors() {
      this.log('Change geography-fill layer colors');
      const { colorMap, map } = this;

      if (map.getLayer(`${this.geography.id}-fill`)) {
        map.setPaintProperty(`${this.geography.id}-fill`, 'fill-color', colorMap);
      }
    },
  },
};
</script>

<style lang="scss">
.map-container {
  min-height: 600px;
  position: relative;
}

#map {
    width: 100%;
    height: 600px;
}

.mapboxgl-popup {
    max-width: 400px;
}

.mapboxgl-popup-content {
    padding: 10px 10px 5px;
}

#btnPitch {
    position: absolute;
    bottom: 4px;
    left: 4px;
    border-radius: 4px;
    height: 30px;
    min-width: 30px;
    padding: 4px 7px;
    line-height: inherit;
    background-color: rgba(158,158,158, 0.40);
}

.mapboxgl-ctrl-geocoder input[type="text"] {
    color: rgba(0, 0, 0, 0.8);
}

.hover_popup {
  z-index: 1000;
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

</style>
