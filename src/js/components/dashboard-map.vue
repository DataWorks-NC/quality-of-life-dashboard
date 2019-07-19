<template lang="html">
  <div class="" style="position: relative; width: 100%; height: 100%">
    <div id="map" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import mapboxgl from 'mapbox-gl';
import MapboxGlGeocoder from '@mapbox/mapbox-gl-geocoder';
import { prettyNumber } from '../modules/number_format';
import FullExtent from '../modules/map-fullextent';
import config from '../modules/config';

export default {
  // You would think to just name this component 'Map', but <map> is in the HTML5 spec!
  name: 'DashboardMap',
  props: {
    mapboxAccessToken: String,
    mapConfig: Object,
  },

  data() {
    return {
      isPitched3D: false,
      locationPopup: null,
      mapLoaded: false,
      colors: config.colors,
    };
  },

  computed: mapState(['breaks', 'geography', 'highlight', 'metric', 'metricId', 'printMode', 'selected', 'year']),

  watch: {
    'selected': ['styleNeighborhoods', 'rescale'],
    'highlight': 'styleNeighborhoods',
    'breaks': 'updateBreaks',
    'year': 'updateYear',
    'geography': 'updateGeography',
    'isPitched3D': 'toggle3D',
  },

  mounted() {
    this.map = null;
    this.geocoder = null;
    this.mapMetricId = this.metricId;
    this.initMap();
  },

  methods: {
    initMap() {
      const mapOptions = Object.assign({
        container: 'map',
        attributionControl: false,
      }, this.mapConfig);
      this.map = new mapboxgl.Map(mapOptions);

      const _this = this;
      const { map } = _this;
      mapboxgl.accessToken = _this.mapboxAccessToken;

      this.locationPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
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

      if (!this.printMode) {
        this.geocoder = new MapboxGlGeocoder({
          accessToken: _this.mapboxAccessToken,
          country: 'us',
          bbox: [-79.01, 35.87, -78.7, 36.15],
          placeholder: this.$t('map.SearchPlaceholder'),
          zoom: 14,
          marker: true,
          mapboxgl,
        }).on('result', (e) => {
          if (e.result) {
            // Clear selection and select underlying area. Remove duplicates by casting to Set.
            const features = Array.from(
              new Set(
                map.queryRenderedFeatures(
                  map.project(e.result.center),
                  { layers: [`${_this.geography.id}-fill`] },
                )
                  .map(g => g.properties.id),
              ),
            );

            _this.$router.push({ query: { ..._this.$route.query, selected: features } });
            _this.zoomToIds(features);
          }
        }).on('clear', () => {
          if (map.getLayer('point')) {
            map.getSource('point').setData({
              "type": "FeatureCollection",
              "features": [],
            });
          }
        });
        map.addControl(this.geocoder, 'bottom-right');
      }

      // disable map rotation until 3D support added
      // map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      // after map initiated, grab geography and initiate/style neighborhoods
      map.once('style.load', () => {
        // Add tracts
        map.addSource(_this.geography.id, {
          type: 'geojson',
          data: `/data/${_this.geography.id}.geojson.json`,
        });

        _this.mapLoaded = true;
        _this.initNeighborhoods();
        _this.styleNeighborhoods();
        _this.initMapEvents();
        if (_this.selected) {
          // QueryRenderedFeatures doesn't seem to work until even after map has loaded styles :/
          setTimeout(() => { _this.rescale(); }, 2500);
        }
      });
    },
    toggle3D() {
      const _this = this;
      const { map } = _this;
      const pitched = _this.isPitched3D;

      if (pitched) {
        map.setLayoutProperty(`${_this.geography.id}`, 'visibility', 'none');
        map.setLayoutProperty(`${_this.geography.id}-fill-extrude`, 'visibility', 'visible');
      } else {
        map.setLayoutProperty(`${_this.geography.id}`, 'visibility', 'visible');
        map.setLayoutProperty(`${_this.geography.id}-fill-extrude`, 'visibility', 'none');
      }
    },
    initMapEvents() {
      const { map } = this;
      const _this = this;

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      map.on('rotate', () => {
        _this.isPitched3D = (map.getPitch() >= 20);
      });

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
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (!iOS) {
        // show feature info on mouse move
        map.on('mousemove', (e) => {
          if (!_this.metric.config || !_this.metric.data) {
            return;
          }
          const features = map.queryRenderedFeatures(e.point, { layers: [`${_this.geography.id}-fill`] }).filter(f => _this.metric.data.map[f.properties.id][`y_${_this.year}`] !== null); // Only show popup when metric value is not null

          if (!features.length) {
            popup.remove();
            map.getCanvas().style.cursor = '';
            return;
          }

          map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

          const feature = features[0];
          const { id } = feature.properties;
          const data = _this.metric.data.map[id][`y_${_this.year}`];
          const geographyLabel = _this.$i18n.locale === 'en' ? _this.geography.label(id) : _this.geography.label_es(id);
          const val = prettyNumber(data, _this.metric.config.decimals, _this.metric.config.prefix,
            _this.metric.config.suffix, _this.metric.config.commas);
          const label = _this.metric.config.label ? ` ${_this.$t(`metricLabels.${_this.metric.config.label}`)}` : '';
          popup.setLngLat(map.unproject(e.point))
            .setHTML(
              `<div style="text-align:center; margin:0; padding:0;"><h3 style="font-size:1.2em; margin:0; padding:0; line-height:1em; font-weight:bold;">${geographyLabel}</h3>${val}${label}</div>`,
            )
            .addTo(map);
        });
      }
    },
    initNeighborhoods() {
      const { map } = this;

      // selected neighborhood
      map.addLayer({
        'id': `${this.geography.id}`,
        'type': 'line',
        'source': this.geography.id,
        'layout': {},
        'paint': {},
      }, this.mapConfig.neighborhoodsSelectedBefore);

      map.addLayer({
        'id': `${this.geography.id}-fill`,
        'type': 'fill',
        'source': this.geography.id,
      }, this.mapConfig.neighborhoodsBefore);

      map.addLayer({
        'id': `${this.geography.id}-fill-extrude`,
        'type': 'fill-extrusion',
        'source': this.geography.id,
        'layout': {
          'visibility': 'none',
        },
        'paint': {
          'fill-extrusion-opacity': 1,
        },
      }, this.mapConfig.neighborhoodsSelectedBefore);

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

    styleNeighborhoods() {
      const { map } = this;
      if (map.getLayer(`${this.geography.id}`)) {
        map.setPaintProperty(`${this.geography.id}`, 'line-color', this.getOutlineColor());
        map.setPaintProperty(`${this.geography.id}`, 'line-width', this.getOutlineWidth());
      }

      const colors = this.getColors();

      if (map.getLayer(`${this.geography.id}-fill`)) {
        map.setPaintProperty(`${this.geography.id}-fill`, 'fill-color', colors);
      }
      if (map.getLayer(`${this.geography.id}-fill-extrude`)) {
        map.setPaintProperty(`${this.geography.id}-fill-extrude`, 'fill-extrusion-color', { ...colors, default: 'rgb(242,243,240)' });
        map.setPaintProperty(`${this.geography.id}-fill-extrude`, 'fill-extrusion-height', this.getHeight());
      }

      // Clear the pin that gets dropped on address search when user clears selection.
      if (!this.selected.length && this.geocoder) {
        this.geocoder.clear();
      }
    },

    updateChoropleth() {
      if (this.mapLoaded) {
        this.styleNeighborhoods();
      }
    },

    updateBreaks() {
      this.mapMetricId = this.metricId;
      this.updateChoropleth();
    },
    updateYear() {
      if (this.metricId === this.mapMetricId) {
        this.updateChoropleth();
      }
    },

    updateGeography(newGeography, oldGeography) {
      if (!this.geography.id) return;
      const oldMapLayers = [`${oldGeography.id}`, `${oldGeography.id}-fill`, `${oldGeography.id}-fill-extrude`, `${oldGeography.id}-outlines`];
      const newMapLayers = [`${newGeography.id}`, `${newGeography.id}-fill`, `${newGeography.id}-outlines`];
      const _this = this;

      if (!this.map.getSource(newGeography.id)) {
        this.map.addSource(newGeography.id, {
          type: 'geojson',
          data: `/data/${this.geography.id}.geojson.json`,
        });
      }

      oldMapLayers.forEach((layer) => {
        _this.map.setLayoutProperty(layer, 'visibility', 'none');
      });

      newMapLayers.forEach((layer) => {
        if (!_this.map.getLayer(layer)) {
          _this.initNeighborhoods();
        } else {
          _this.map.setLayoutProperty(layer, 'visibility', 'visible');
        }
      });
    },

    rescale(oldSelected = null) {
      try {
        if (this.selected.length) {
          return this.zoomToIds(this.selected);
        } if (!oldSelected) {
          // Only zoom to full extent if you did not just deselect.
          return this.zoomToFullExtent();
        }
      } catch (e) {
        return null;
      }
    },
    zoomToFullExtent() {
      const durhamCountyBounds = [-79.0182952880858949, 35.8613166809082031, -78.6963348388672017, 36.2414207458496023];
      this.map.fitBounds(durhamCountyBounds, { padding: 50 });
      return durhamCountyBounds;
    },
    zoomToIds(ids) {
      const zoomToFeatures = this.map.queryRenderedFeatures({ layers: [this.geography.id], filter: ['match', ['get', 'id'], ids, true, false] });
      if (!zoomToFeatures.length) { return; }
      const bounds = this.getBoundingBox(zoomToFeatures);
      this.map.fitBounds(bounds, { padding: 50 });

      return bounds;
    },
    getOutlineColor() {
      const stops = [];
      const _this = this;

      _this.selected.forEach((id) => {
        stops.push([id, '#00688B']);
      });

      const outline = {
        property: 'id',
        default: 'rgba(0,0,0,0)',
        type: 'categorical',
        stops,
      };

      if (stops.length > 0) {
        return outline;
      }
      return outline.default;
    },
    getOutlineWidth() {
      const stops = [];
      const _this = this;

      _this.selected.forEach((id) => {
        stops.push([id, 4]);
      });

      const outlineSize = {
        property: 'id',
        default: 0,
        type: 'categorical',
        stops,
      };

      if (stops.length > 0) {
        return outlineSize;
      }
      return outlineSize.default;
    },
    getColors() {
      if (!this.metric.data) return;

      const stops = [];
      const { breaks } = this;
      const { colors } = this;

      const color = function (val) {
        if (val <= breaks[1]) {
          return colors[0];
        }
        if (val <= breaks[2]) {
          return colors[1];
        } if (val <= breaks[3]) {
          return colors[2];
        } if (val <= breaks[4]) {
          return colors[3];
        } if (val <= breaks[5]) {
          return colors[4];
        }
      };

      Object.keys(this.metric.data.map).forEach((id) => {
        const value = this.metric.data.map[id][`y_${this.year}`];

        if (this.highlight.indexOf(id) !== -1) {
          stops.push([id, '#F7E55B']);
        } else if (value !== null) {
          stops.push([id, color(value)]);
        }
      });

      return {
        property: 'id',
        default: 'rgba(242,243,240,0)',
        type: 'categorical',
        stops,
      };
    },
    getHeight() {
      if (!this.metric.data) return;

      const stops = [];
      const heightAdjust = x => (
        (x - this.breaks[0])
          * 3000 / (this.breaks[this.breaks.length - 1] - this.breaks[0])
      );

      Object.keys(this.metric.data.map).forEach((id) => {
        const value = this.metric.data.map[id][`y_${this.year}`];
        if (value !== null) {
          stops.push([id, heightAdjust(value)]);
        }
      });

      return {
        property: 'id',
        default: 0,
        type: 'categorical',
        stops,
      };
    },
    getBoundingBox(features) {
      const longitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[0]))), []);
      const latitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map(c => c[1]))), []);
      return [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]];
    },
    addToSelected(featureId) {
      this.$router.push({ query: { ...this.$route.query, selected: this.selected.concat(featureId) } });
    },
    removeFromSelected(featureId) {
      const i = this.selected.indexOf(featureId);
      if (i !== -1) {
        this.$router.push({ query: { ...this.$route.query, selected: this.selected.slice(0, i).concat(this.selected.slice(i + 1)) } });
      }
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

#map .mapboxgl-ctrl-geocoder {
  font-family: inherit;
}

div#map {
  font-family: inherit;
}
</style>
