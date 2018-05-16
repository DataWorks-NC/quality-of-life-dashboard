<template>
    <div>
    <div id="map"></div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

export default {
  name: 'report-map',
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
    }
  },
  methods: {
    initMap: function() {
      const mapConfig = this.mapConfig;
      const mapOptions = {
        container: 'map',
        interactive: false,
        style: mapConfig.style,
        attributionControl: false,
        zoom: mapConfig.zoom,
        center: mapConfig.center,
        maxBounds: mapConfig.maxBounds,
        minZoom: mapConfig.minZoom,
        preserveDrawingBuffer: mapConfig.preserveDrawingBuffer,
      };

      let map = new mapboxgl.Map(mapOptions);

      // disable map rotation until 3D support added
      // map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();

      let _this = this;
      // after map initiated, grab geography and initiate/style neighborhoods
      map.once('style.load', function () {
        axios.get(`data/${_this.geographyId}.geojson.json`)
        .then(function(response) {
          let geoJSON = response.data;
          geoJSON.features = geoJSON.features.filter((g) => (_this.selectedGeographies.indexOf(g.properties.id) !== -1));
          let bounds = _this.getBoundingBox(geoJSON.features);
          map.fitBounds(bounds, { padding: 50 });

          map.addSource('neighborhoods', {
            type: 'geojson',
            data: geoJSON
          });


          // neighborhood boundaries
          // TODO: Is `building` the right layer for this to be before?
          map.addLayer({
            'id': 'neighborhoods',
            'type': 'line',
            'source': 'neighborhoods',
          }, 'tunnel_motorway_link_casing');
          map.addLayer({
            'id': 'neighborhoods-fill-extrude',
            'type': 'fill-extrusion',
            'source': 'neighborhoods',
            'paint': {
              'fill-extrusion-opacity': 1
            }
          }, 'waterway_river');
          if (map.getLayer('neighborhoods')) {
            map.setPaintProperty('neighborhoods', 'line-color', '#00688B');
            map.setPaintProperty('neighborhoods', 'line-width', 2);
          }
          if (map.getLayer('neighborhoods-fill-extrude')) {
            map.setPaintProperty('neighborhoods-fill-extrude', 'fill-extrusion-color', '#F7E55B');
          }
        });
      });
    },
    getBoundingBox: function(features) {
      let longitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map((c) => c[0]))), []);
      let latitudes = features.reduce((i, f) => (i.concat(f.geometry.coordinates[0].map((c) => c[1]))), []);
      return [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]];
    }

  },
  mounted: function () {
    this.initMap();
  }
};

</script>

<style scoped>
#map {
    height: 400px;
}

#map img {
    max-width: none;
    min-width: 0px;
    height: auto;
}
</style>