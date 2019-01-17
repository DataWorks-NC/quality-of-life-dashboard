const _ = require('lodash');
const siteConfig = require('./data/config/site.js');
const dataConfig = require('./data/config/data.js');
const privateConfig = require('./data/config/private.js');

// whatsnew handlebars data
let whatsnew = _.filter(dataConfig, function(el) {
  return siteConfig.whatsnew.indexOf(el.metric) !== -1;
});

module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/,
        'app.js': ['app/js/main.js', /^app\/js\/modules/, /^app\/js\/components\/(?!report)/],
        'report.js': ['app/js/report.js', /^app\/js\/modules/, /^app\/js\/components\/report/],
      }
    },
    stylesheets: {
      joinTo: {
        'vendor.css': /^(?!app)/,
        'map.css': /mapbox-gl.css/,
        'app.css': /^app\/css/,
        'report.css': /^app\/css\/report/,
      }
    }
  },
  npm: {
    styles: {
      'material-design-lite': ['dist/material.min.css'],
      'mapbox-gl': ['dist/mapbox-gl.css'],
      '@mapbox/mapbox-gl-geocoder': ['dist/mapbox-gl-geocoder.css'],
      'chartist': ['dist/chartist.css'],
    }
  },
  plugins: {

    babel: {
      presets: [
        [
          'env',
          {
            targets: {
              browsers: ['last 2 versions', 'safari >= 8']
            }
          }
        ]
      ],
      ignore: [/node_modules/]
    },
    postcss: {
      processors: [require('postcss-cssnext')({browsers: ['last 2 versions']})]
    },
    handlebars: {
      locals: {
        siteConfig: siteConfig,
        dataConfig: dataConfig,
        privateConfig: privateConfig,
        selectgroups: require('./data/config/selectgroups.js'),
        whatsnew: whatsnew,
      },
      include: {enabled: false}
    },
    swPrecache: {
      options: {
        staticFileGlobs: [
          'public/**/*.{js,css,png,jpg,gif,svg,eot,ttf,woff,woff2}',
          'public/index.html',
          'public/manifest.json',
          'public/data/blockgroup.geojson.json',
          'public/data/tract.geojson.json',
          'public/style/osm-liberty.json'
        ],
        stripPrefix: 'public/'
      }
    },
    uglify: {
      mangle: false,
      compress: {
        global_defs: {
          DEBUG: false
        }
      }
    },
    cssnano: {
      autoprefixer: {
        add: true
      }
    }
  }
};
