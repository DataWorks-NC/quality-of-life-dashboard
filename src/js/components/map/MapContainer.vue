<template lang="html">
  <div class="map-container">
    <div class="" style="position: relative; width: 100%; height: 100%">
      <div id="map" />
      <selected-layers v-if="mapLoaded && selected.length > 0" :color-map="colorMap" :map="map" @layers-loaded="rescale" />
      <select-group-outline v-if="mapLoaded && selectGroupName" :map="map" :select-group-name="selectGroupName" @layers-loaded="rescale" />
      <geocoder v-if="mapLoaded && !printMode" :map="map" :mapbox-access-token="mapboxAccessToken" />
    </div>
    <dashboard-legend />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import mapboxgl from 'mapbox-gl';
import { prettyNumber } from '../../modules/number_format';
import FullExtent from '../../modules/map-fullextent';
import config from '../../modules/config';

import 'mapbox-gl/dist/mapbox-gl.css';

import DashboardLegend from "../dashboard-legend.vue";
import debugLogMixin from '../mixins/debugLogMixin';

const Geocoder = () => import(/* webpackChunkName: "geocoder" */ './Geocoder.vue');
const SelectGroupOutline = () => import(/* webpackChunkName: "select-group-outline" */ './SelectGroupOutline.vue');
const SelectedLayers = () => import(/* webpackChunkName: "selected-layers" */ './SelectedLayers.vue');

export default {
  // You would think to just name this component 'Map', but <map> is in the HTML5 spec!
  name: 'MapContainer',
  components: {
    Geocoder,
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
    };
  },

  computed: {
    ...mapState(
      ['breaks', 'geography', 'highlight', 'metric', 'metricId', 'printMode', 'year'],
    ),
    ...mapGetters(['selected', 'selectGroupName', 'selectGroupType']),
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
    'colorMap': 'updateChoroplethColors',
    'highlight': 'updateChoroplethColors',
    'geography.id': 'updateGeography',
  },
  mounted() {
    // Add these at mount time because they should not be reactive properties (don't want
    // component to update each time they change).
    this.hoverPopup = null;
    this.initMap();
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
        _this.initMapEvents();
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
      }, 'choropleth_placeholder');
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
      if (bounds) {
        this.map.fitBounds(bounds, { padding: 150 });
      }
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
      if (bounds) {
        this.map.fitBounds(bounds, { padding: 150 });
      }

      return bounds;
    },
    getBoundingBox(features) {
      this.log(`Get bounding box`);
      if (!features || features.length === 0) {
        return false;
      }
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
      if (!this.mapLoaded) return;
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
</style>
