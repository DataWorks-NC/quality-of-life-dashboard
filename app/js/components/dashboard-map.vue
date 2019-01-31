<template lang="html">
  <div class="" style="position: relative; width: 100%; height: 100%">
    <div id="map"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import mapboxgl from 'mapbox-gl';
import MapboxGlGeocoder from '@mapbox/mapbox-gl-geocoder';
import axios from 'axios';
import { prettyNumber } from '../modules/number_format';
import FullExtent from '../modules/map-fullextent.js';

export default {
  // You would think to just name this component 'Map', but <map> is in the HTML5 spec!
  name: 'dashboard-map',
  props: ['mapboxAccessToken', 'mapConfig'],
  data() {
    return {
      geoJSON: null,
      isPitched3D: false,
      locationPopup: null,
      map: null,
      mapLoaded: false,
      neighborhoodsBefore: null,
      neighborhoodsSelectedBefore: null,
    }
  },
  computed: mapState({
    breaks: 'breaks',
    colors: 'colors',
    geography: 'geography',
    highlight: 'highlight',
    metric: 'metric',
    metricId: 'metricId',
    selected: 'selected',
    year: 'year',
    zoomNeighborhoods: 'zoomNeighborhoods',
  }),
  watch: {
    'selected': 'styleNeighborhoods',
    'highlight': 'styleNeighborhoods',
    'breaks': 'updateBreaks',
    'year': 'updateYear',
    'zoomNeighborhoods': 'changeZoomNeighborhoods',
    'geography': 'updateGeography',
    'isPitched3D': 'toggle3D',
  },

  mounted: function () {
    this.mapMetricId = this.metricId;
    this.mapGeographyId = this.geography.id;
    this.initMap();
  },
  methods: {
    initMap: function () {
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

      let _this = this;
      let map = _this.map;
      mapboxgl.accessToken = _this.mapboxAccessToken;

      this.locationPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
      });

      // add nav control
      let nav = new mapboxgl.NavigationControl();
      map.addControl(nav, 'top-right');

      // add full extent button
      map.addControl(new FullExtent(
        mapOptions.center,
        mapOptions.zoom,
      ), 'top-right');
      map.addControl(new mapboxgl.GeolocateControl(), 'top-right');

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
          let features = map.queryRenderedFeatures(map.project(e.result.center), { layers: ['neighborhoods-fill-extrude'] });
          _this.$store.commit('clearSelected');
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

      // disable map rotation until 3D support added
      // map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      // after map initiated, grab geography and initiate/style neighborhoods
      map.once('style.load', () => {
                axios.get(`data/${_this.geography.id}.geojson.json`)
                    .then(function(response) {
                        _this.mapLoaded = true;
                        _this.geoJSON = response.data;
                        _this.initNeighborhoods();
                        _this.styleNeighborhoods();
                        _this.initMapEvents();
                });
            });
        },
    toggle3D: function () {
      let _this = this;
      let map = _this.map;
      let pitched = _this.isPitched3D;

      if (pitched) {
        map.setLayoutProperty('neighborhoods', 'visibility', 'none');
        map.moveLayer('neighborhoods-fill-extrude');
        map.setPaintProperty("neighborhoods-fill-extrude", 'fill-extrusion-height', _this.getHeight());
      } else {
        map.setLayoutProperty('neighborhoods', 'visibility', 'visible');
        map.moveLayer('neighborhoods-fill-extrude', 'building');
        map.setPaintProperty("neighborhoods-fill-extrude", 'fill-extrusion-height', 0);
      }
    },
    initMapEvents: function () {
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
                let features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill-extrude'] });
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
                    let features = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill-extrude'] });
                    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

                    if (!features.length) {
                        popup.remove();
                        return;
                    }

                    const feature = features[0];
                    const id = feature.properties.id;
                  const data = _this.metric.data.map[id][`y_${_this.year}`];
                  const geographyLabel = _this.geography.label(id);
                  const val = prettyNumber(data, _this.metric.config.decimals, _this.metric.config.prefix, _this.metric.config.suffix, _this.metric.config.commas);
                  const label = _this.metric.config.label ? ` ${_this.metric.config.label}` : '';
                  popup.setLngLat(map.unproject(e.point))
                        .setHTML(`<div style="text-align: center; margin: 0; padding: 0;"><h3 style="font-size: 1.2em; margin: 0; padding: 0; line-height: 1em; font-weight: bold;">${geographyLabel}</h3>${val}${label}</div>`)
                        .addTo(map);

                });
      }
    },
    initNeighborhoods: function () {
      let map = this.map;
      let _this = this;
      let geoJSON = _this.geoJSON;

      map.addSource('neighborhoods', {
        type: 'geojson',
        data: geoJSON,
      });

      // selected neighborhood
      map.addLayer({
        'id': 'neighborhoods',
        'type': 'line',
        'source': 'neighborhoods',
        'layout': {},
        'paint': {},
      }, _this.neighborhoodsSelectedBefore);


      map.addLayer({
        'id': 'neighborhoods-fill-extrude',
        'type': 'fill-extrusion',
        'source': 'neighborhoods',
        'paint': {
          'fill-extrusion-opacity': 1,
        },
      }, _this.neighborhoodsBefore);

      // neighborhood boundaries
      map.addLayer({
        'id': 'neighborhoods-outlines',
        'type': 'line',
        'source': 'neighborhoods',
        'layout': {},
        'paint': {
          'line-color': 'rgba(0,0,0,1)',
          'line-width': 0.4,
        },
      }, _this.neighborhoodsBefore);
    },
    styleNeighborhoods: function () {
      let map = this.map; let
_this = this;
      if (map.getLayer('neighborhoods')) {
        map.setPaintProperty('neighborhoods', 'line-color', _this.getOutlineColor());
        map.setPaintProperty('neighborhoods', 'line-width', _this.getOutlineWidth());
      }
      if (map.getLayer('neighborhoods-fill-extrude')) {
        map.setPaintProperty('neighborhoods-fill-extrude', 'fill-extrusion-color', _this.getColors());

        if (_this.isPitched3D) {
          map.setPaintProperty('neighborhoods-fill-extrude', 'fill-extrusion-height', _this.getHeight());
        }
      }
    },
    updateChoropleth: function () {
      let _this = this;
      if (this.mapLoaded) {
        this.styleNeighborhoods();
      }
    },
    updateBreaks: function () {
      this.mapMetricId = this.metricId;
      this.updateChoropleth();
    },
    updateYear: function () {
      if (this.metricId === this.mapMetricId) {
        this.updateChoropleth();
      }
    },
    updateGeography: function () {
      let _this = this;
      this.mapGeographyId = this.geography.id;
      axios.get(`data/${_this.geography.id}.geojson.json`)
        .then((response) => {
            _this.map.getSource('neighborhoods').setData(response.data);
            _this.styleNeighborhoods();
          });
    },
    geoJSONMerge: function () {
      let _this = this;
      let geoObj = geojsonDataMerge(_this.geoJSON, _this.metric.data.map, _this.year);
      return geoObj;
    },
    changeZoomNeighborhoods: function () {
      let bounds = new mapboxgl.LngLatBounds();
      let _this = this;

      this.geoJSON.features.forEach((feature) => {
                if (_this.zoomNeighborhoods.indexOf(feature.properties.id) !== -1) {
                    feature.geometry.coordinates.forEach(function(coord) {
                        coord.forEach(function(el) {
                            bounds.extend(el);
                        })
                    });
                }
            });

      if (!bounds.isEmpty()) {
        this.map.fitBounds(bounds, {padding: 100});
      }
    },
    getFullBounds: function () {
      let bounds = new mapboxgl.LngLatBounds();
      let _this = this;

      this.geoJSON.features.forEach((feature) => {
                feature.geometry.coordinates.forEach(function(coord) {
                    coord.forEach(function(el) {
                        bounds.extend(el);
                    })
                });
            });

      return bounds;
    },
    getSelectedBounds: function () {
      let bounds = new mapboxgl.LngLatBounds();
      let _this = this;

      this.geoJSON.features.forEach((feature) => {
                if (_this.selected.indexOf(feature.properties.id) !== -1) {
                    feature.geometry.coordinates.forEach(function(coord) {
                        coord.forEach(function(el) {
                            bounds.extend(el);
                        })
                    });
                }
            });

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
            }

            if (stops.length > 0) {
                return outlineSize;
            } 
                return outlineSize.default;
            
        },
    getColors: function () {
      const stops = [];
      let _this = this;
      let data = _this.metric.data.map;
      let breaks = _this.breaks;
      let colors = _this.colors;

      let color = function(val) {
                if (val <= breaks[1]) {
                    return colors[0];
                } if (val <= breaks[2]) {
                    return colors[1];
                }
                 else if (val <= breaks[3]) {
                    return colors[2];
                }
                 else if (val <= breaks[4]) {
                    return colors[3];
                }
                 else if (val <= breaks[5]) {
                    return colors[4];
                }
            };

      Object.keys(data).forEach((id) => {
        const value = data[id][`y_${_this.year}`];

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
    getHeight: function () {
      let _this = this;
      const stops = [];
      let data = _this.metric.data.map;
      let heightAdjust =                (x) => (
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
