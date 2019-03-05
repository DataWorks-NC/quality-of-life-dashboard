<template lang="html">
  <div class="" style="position: relative; width: 100%; height: 100%">
    <div id="map"/>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import mapboxgl from 'mapbox-gl';
import MapboxGlGeocoder from '@mapbox/mapbox-gl-geocoder';
import { prettyNumber } from '../modules/number_format';
import FullExtent from '../modules/map-fullextent.js';
import config from '../modules/config';

export default {
  // You would think to just name this component 'Map', but <map> is in the HTML5 spec!
  name: 'dashboard-map',
  props: ['mapboxAccessToken', 'mapConfig'],

  data() {
    return {
      geoJSON: null,
      isPitched3D: false,
      locationPopup: null,
      mapLoaded: false,
      colors: config.colors,
    }
  },

  // For some reason brunch doesn't like object spread syntax, so using Object.assign here.
  computed: Object.assign(
      mapState(['breaks', 'geography', 'highlight', 'metric', 'metricId', 'printMode', 'selected', 'year', 'zoomNeighborhoods']),
  ),

  watch: {
    'selected': 'styleNeighborhoods',
    'highlight': 'styleNeighborhoods',
    'breaks': 'updateBreaks',
    'year': 'updateYear',
    'zoomNeighborhoods': 'changeZoomNeighborhoods',
    'geography': 'updateGeography',
    'isPitched3D': 'toggle3D',
  },

  mounted: function() {
    this.map = null;
    this.mapMetricId = this.metricId;
    this.initMap();
  },
  methods: {
    initMap: function() {
      const mapOptions = {
        container: 'map',
        style: this.mapConfig.style,
        attributionControl: false,
        zoom: this.mapConfig.zoom,
        center: this.mapConfig.center,
        maxBounds: this.mapConfig.maxBounds,
        minZoom: this.mapConfig.minZoom,
        preserveDrawingBuffer: this.mapConfig.preserveDrawingBuffer,
      };
      this.map = new mapboxgl.Map(mapOptions);

      const _this = this;
      const map = _this.map;
      mapboxgl.accessToken = _this.mapboxAccessToken;

      this.locationPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
      });

      // Add attribution to print maps.
      if (this.printMode) {
        map.addControl(new mapboxgl.AttributionControl({ compact: false, customAttribution: 'Map from the Durham Neighborhood Compass, a project of DataWorks NC. Visit compass.durhamnc.gov to build your own map.'}));
      }

      // add nav control
      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav, 'top-right');

      // add full extent button
      map.addControl(new FullExtent(
          mapOptions.center,
          mapOptions.zoom,
      ), 'top-right');
      map.addControl(new mapboxgl.GeolocateControl(), 'top-right');

      if (!this.printMode) {
        map.addControl(new MapboxGlGeocoder({
          accessToken: _this.mapboxAccessToken,
          country: 'us',
          bbox: [-79.01, 35.87, -78.7, 36.15],
          placeholder: 'Search for an address, neighborhood or landmark',
          zoom: 14,
        }).on('result', (e) => {
          if (e.result) {
            // create the marker
            const markers = {
              "type": "FeatureCollection",
              "features": [
                {
                  "type": "Feature",
                  "geometry": {
                    "type": "Point",
                    "coordinates": e.result.center,
                  },
                }],
            };

            if (map.getLayer("point")) {
              map.getSource("point").setData(markers);
            } else {
              map.addLayer({
                "id": "point",
                "type": "symbol",
                "source": {
                  "type": "geojson",
                  "data": markers,
                },
                "layout": {
                  "icon-image": "star_15",
                  "icon-size": 2,
                },
              });
            }

            // Clear selection and select underlying area
            let features = map.queryRenderedFeatures(map.project(e.result.center),
                {layers: [`${_this.geography.id}-fill-extrude`]}).map(g => g.properties.id);
            _this.$store.commit('setSelected', features);
            _this.zoomToIds(features);
          }
        }).on('clear', (e) => {
          if (map.getLayer('point')) {
            map.getSource('point').setData({
              "type": "FeatureCollection",
              "features": [],
            });
          }
          _this.$store.commit('clearSelected');
        }), 'bottom-right');
      }

      // disable map rotation until 3D support added
      // map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      // after map initiated, grab geography and initiate/style neighborhoods
      map.once('style.load', () => {
        // Add tracts
        map.addSource(_this.geography.id, {
          type: 'geojson',
          data: `data/${_this.geography.id}.geojson.json`,
        });

        _this.mapLoaded = true;
        _this.initNeighborhoods();
        _this.styleNeighborhoods();
        _this.initMapEvents();
        _this.zoomToFullExtent();
      });
    },
    toggle3D: function() {
      let _this = this;
      let map = _this.map;
      let pitched = _this.isPitched3D;

      if (pitched) {
        map.setLayoutProperty(`${_this.geography.id}`, 'visibility', 'none');
        map.moveLayer(`${_this.geography.id}-fill-extrude`);
        map.setPaintProperty(`${_this.geography.id}-fill-extrude`, 'fill-extrusion-height', _this.getHeight());
      } else {
        map.setLayoutProperty(`${_this.geography.id}`, 'visibility', 'visible');
        map.moveLayer(`${_this.geography.id}-fill-extrude`, 'building');
        map.setPaintProperty(`${_this.geography.id}-fill-extrude`, 'fill-extrusion-height', 0);
      }
    },
    initMapEvents: function() {
      let map = this.map;
      let _this = this;

      let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.on('rotate', (e) => {
        if (map.getPitch() >= 20) {
          _this.isPitched3D = true;
        } else {
          _this.isPitched3D = false;
        }
      });

      // on feature click add or remove from selected set
      map.on('click', (e) => {
        let features = map.queryRenderedFeatures(e.point, {layers: [`${_this.geography.id}-fill-extrude`]});
        if (!features.length) {
          return;
        }

        let feature = features[0];
        let featureIndex = _this.selected.indexOf(feature.properties.id);

        if (featureIndex === -1) {
          _this.$store.commit('addToSelected', feature.properties.id)
        } else {
          _this.$store.commit('removeSelectedByPos', featureIndex);
        }
      });

      // fix for popup cancelling click event on iOS
      let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (!iOS) {
        // show feature info on mouse move
        map.on('mousemove', (e) => {
          if (!_this.metric.config || !_this.metric.data) {
            return;
          }
          let features = map.queryRenderedFeatures(e.point, {layers: [`${_this.geography.id}-fill-extrude`]});
          map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

          if (!features.length) {
            popup.remove();
            return;
          }

          const feature = features[0];
          const id = feature.properties.id;
          const data = _this.metric.data.map[id][`y_${_this.year}`];
          const geographyLabel = _this.geography.label(id);
          const val = prettyNumber(data, _this.metric.config.decimals, _this.metric.config.prefix,
              _this.metric.config.suffix, _this.metric.config.commas);
          const label = _this.metric.config.label ? ` ${_this.metric.config.label}` : '';
          popup.setLngLat(map.unproject(e.point)).
              setHTML(
                  `<div style="text-align: center; margin: 0; padding: 0;"><h3 style="font-size: 1.2em; margin: 0; padding: 0; line-height: 1em; font-weight: bold;">${geographyLabel}</h3>${val}${label}</div>`).
              addTo(map);

        });
      }
    },
    initNeighborhoods: function() {
      const map = this.map;

      // selected neighborhood
      map.addLayer({
        'id': `${this.geography.id}`,
        'type': 'line',
        'source': this.geography.id,
        'layout': {},
        'paint': {},
      }, this.mapConfig.neighborhoodsSelectedBefore);

      map.addLayer({
        'id': `${this.geography.id}-fill-extrude`,
        'type': 'fill-extrusion',
        'source': this.geography.id,
        'paint': {
          'fill-extrusion-opacity': 1,
        },
      }, this.mapConfig.neighborhoodsBefore);

      // neighborhood boundaries
      map.addLayer({
        'id': `${this.geography.id}-outlines`,
        'type': 'line',
        'source': this.geography.id,
        'layout': {},
        'paint': {
          'line-color': 'rgba(0,0,0,1)',
          'line-width': 0.4,
        },
      }, this.mapConfig.neighborhoodsBefore);
    },

    styleNeighborhoods: function() {
      let map = this.map;
      let _this = this;
      if (map.getLayer(`${_this.geography.id}`)) {
        map.setPaintProperty(`${_this.geography.id}`, 'line-color', _this.getOutlineColor());
        map.setPaintProperty(`${_this.geography.id}`, 'line-width', _this.getOutlineWidth());
      }
      if (map.getLayer(`${_this.geography.id}-fill-extrude`)) {
        map.setPaintProperty(`${_this.geography.id}-fill-extrude`, 'fill-extrusion-color', _this.getColors());

        if (_this.isPitched3D) {
          map.setPaintProperty(`${_this.geography.id}-fill-extrude`, 'fill-extrusion-height', _this.getHeight());
        }
      }
    },

    updateChoropleth: function() {
      if (this.mapLoaded) {
        this.styleNeighborhoods();
      }
    },

    updateBreaks: function() {
      this.mapMetricId = this.metricId;
      this.updateChoropleth();
    },
    updateYear: function() {
      if (this.metricId === this.mapMetricId) {
        this.updateChoropleth();
      }
    },

    updateGeography: function(newGeography, oldGeography) {
      if (!this.geography.id) return;
      const oldMapLayers = [`${oldGeography.id}`, `${oldGeography.id}-fill-extrude`, `${oldGeography.id}-outlines`];
      const newMapLayers = [`${newGeography.id}`, `${newGeography.id}-fill-extrude`, `${newGeography.id}-outlines`];
      const _this = this;

      if (!this.map.getSource(newGeography.id)) {
        this.map.addSource(newGeography.id, {
          type: 'geojson',
          data: `data/${this.geography.id}.geojson.json`,
        });
      }

      oldMapLayers.forEach(layer => {
        _this.map.setLayoutProperty(layer, 'visibility', 'none');
      });

      newMapLayers.forEach(layer => {
        if (!_this.map.getLayer(layer)) {
          _this.initNeighborhoods();
        } else {
          _this.map.setLayoutProperty(layer, 'visibility', 'visible');
        }
      });
    },

    changeZoomNeighborhoods: function() {
      return this.zoomToIds(this.zoomNeighborhoods);
    },

    zoomToFullExtent: function() {
      const durhamCountyBounds = [-79.0182952880858949,35.8613166809082031, -78.6963348388672017, 36.2414207458496023];
      this.map.fitBounds(durhamCountyBounds, { padding: 50 });
      return durhamCountyBounds;
    },
    zoomToIds: function(ids) {
      const zoomToFeatures = this.map.queryRenderedFeatures({ layers: [this.geography.id], filter: ['match', ['get', 'id'], ids, true, false ] });
      if (!zoomToFeatures.length) { return; }
      const bounds = this.getBoundingBox(zoomToFeatures);
      this.map.fitBounds(bounds, { padding: 50 });

      return bounds;
    },
    getOutlineColor: function() {
      const stops = [];
      let _this = this;

      _this.selected.forEach(id => {
        stops.push([id, '#00688B']);
      });

      let outline = {
        property: 'id',
        default: 'rgba(0,0,0,0)',
        type: 'categorical',
        stops: stops
      }

      if (stops.length > 0) {
        return outline;
      }
      return outline.default

    },
    getOutlineWidth: function() {
      const stops = [];
      let _this = this;

      _this.selected.forEach(id => {
        stops.push([id, 4]);
      });

      let outlineSize = {
        property: 'id',
        default: 0,
        type: 'categorical',
        stops: stops
      };

      if (stops.length > 0) {
        return outlineSize;
      }
      return outlineSize.default;

    },
    getColors: function() {
      if (!this.metric.data) return;

      const stops = [];
      const breaks = this.breaks;
      const colors = this.colors;

      let color = function(val) {
        if (val <= breaks[1]) {
          return colors[0];
        }
        if (val <= breaks[2]) {
          return colors[1];
        } else if (val <= breaks[3]) {
          return colors[2];
        } else if (val <= breaks[4]) {
          return colors[3];
        } else if (val <= breaks[5]) {
          return colors[4];
        }
      };

      const _this = this;
      Object.keys(_this.metric.data.map).forEach((id) => {
        const value = _this.metric.data.map[id][`y_${_this.year}`];

        if (_this.highlight.indexOf(id) !== -1) {
          stops.push([id, '#F7E55B']);
        } else if (value !== null) {
          stops.push([id, color(value)]);
        }
      });

      return {
        property: 'id',
        default: 'rgb(242,243,240)',
        type: 'categorical',
        stops: stops,
      };
    },
    getHeight: function() {
      let _this = this;
      const stops = [];
      let data = _this.metric.data.map;
      let heightAdjust = (x) => (
          (x - _this.breaks[0])
          * 3000 / (_this.breaks[this.breaks.length - 1] - _this.breaks[0])
      );

      Object.keys(data).forEach((id) => {
        const value = data[id][`y_${_this.year}`];
        if (value !== null) {
          stops.push([id, heightAdjust(value)]);
        }
      });

      return {
        property: 'id',
        default: 0,
        type: 'categorical',
        stops: stops,
      };
    },
    getBoundingBox(features) {
      const longitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[0]))), []);
      const latitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[1]))), []);
      return [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]];
    },
  },
};
</script>

<style lang="css">
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
</style>
