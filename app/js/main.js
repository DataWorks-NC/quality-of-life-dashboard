// __________________________________
//   QoL Dashboard v3               |
//   Tobin Bradley                  |
//   Mecklenburg County GIS         |
// ----------------------------------
//        \   ^__^
//         \  (oo)\_______
//            (__)\       )\/\
//                ||----w |
//                ||     ||
//

require('es6-promise').polyfill(); // Fix for axios on IE11
require('./modules/ie-polyfill-array-from.js'); // fix for array from on IE11
require('material-design-lite');

//import {introJs} from 'intro.js';
import Vue from 'vue/dist/vue.js';
import Rollbar from 'vue-rollbar';
import axios from 'axios';
import dataConfigUnsorted from '../../data/config/data';
import mapConfig from '../../data/config/map';
import siteConfig from '../../data/config/site';
import privateConfig from '../../data/config/private';
import colors from './modules/breaks';
import fetchData from './modules/fetch';
import {
  replaceState,
  gaEvent,
  getHash,
  urlArgsToHash
} from './modules/tracking';
import scrollTo from './modules/scrollto';
import querystring from 'querystring';
import Sidenav from './components/sidebar-nav.vue';
import Metadata from './components/metadata.vue';
import YearControl from './components/years.vue';
import DataTable from './components/datatable.vue';
import TrendChart from './components/trendchart.vue';
import DistributionChart from './components/distributionchart.vue';
import ToC from './components/toc.vue';
import MapGL from './components/map.vue';
import EmbedCode from './components/embedcode.vue';
import Footer from './components/footer.vue';
import Social from './components/social.vue';
import Feedback from './components/feedback.vue';
import Offline from './components/offline.vue';
import Tabs from './components/tabs.vue';
import GeographySwitcher from './components/geography-switcher.vue';
import UndermapButtons from './components/undermap-buttons.vue';
import ieSVGFixes from './modules/ie-svg-bugs.js';

import 'vueify/lib/insert-css'; // required for .vue file <style> tags

// to fix vue not including modules bug
import 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder';
import {scaleLinear} from 'd3-scale';
import debounce from 'lodash.debounce';

if (privateConfig.hasOwnProperty('rollbarAccessToken') && privateConfig.rollbarAccessToken) {
  Vue.use(Rollbar, {
    accessToken: privateConfig.rollbarAccessToken,
  });
}


Vue.config.productionTip = false;

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// fix ie SVG bugs
ieSVGFixes();

// help system
//for (const el of document.querySelectorAll('.help')) {
//  el.addEventListener('click', function() {
//    console.log('click');
//    introJs().start();
//  });
//}

// youtube video
// document.querySelector('.youtube').addEventListener('click', function() {
//   let theElem = document.querySelector('.youtube');
//   let id = theElem.getAttribute('id');

//   // create iframe
//   var iframe = document.createElement('iframe');
//   var url = `https://www.youtube.com/embed/${
//     id
//   }?autoplay=1&autohide=1&${theElem.getAttribute('data-params')}`;
//   iframe.src = url;
//   iframe.setAttribute('allowfullscreen', 'allowfullscreen');
//   iframe.setAttribute('frameborder', '0');
//   iframe.setAttribute('aria-label', 'GeoPortal video tutorial');
//   theElem.appendChild(iframe);
// });

// Sort dataConfig alphabetically by metric and category
let dataConfigTemp = [];
for (let key in dataConfigUnsorted) {
  if (dataConfigUnsorted.hasOwnProperty(key)) {
    let t = dataConfigUnsorted[key];
    t._key = key;
    dataConfigTemp.push(t);
  }
}
dataConfigTemp = dataConfigTemp.sort((a, b) => {
  if (a.category > b.category) return 1;
  if (a.category < b.category) return -1;
  if (a.title > b.title) return 1;
  if (a.title < b.title) return -1;
  return 0;
});
const dataConfig = dataConfigTemp.reduce((obj, curVal) => { obj[curVal._key] = curVal; return obj; }, {});

// the shared state between components
let appState = {
  metric: {
    config: null,
    years: [],
    data: null
  },
  colors: colors.breaksGnBu5,
  breaks: [0, 0, 0, 0, 0, 0],
  selected: [],
  highlight: [],
  year: null,
  metadata: null,
  zoomNeighborhoods: [],
  geography: siteConfig.geographies[0],
};

// for debugging
//window.appState = appState;

// fix meta links
let model = {metricId: ''};
window.model = model;

// reset old GET args to hash
urlArgsToHash();

// get random metric if none provided and validate if metric is provided
let keys = Object.keys(dataConfig);
let metricId = keys[Math.floor(Math.random() * keys.length)].replace('m', '');
if (getHash(0)) {
  let passedMetric = getHash(0).replace('m', '');
  if (keys.indexOf(`m${passedMetric}`) !== -1) {
    metricId = passedMetric;
  }
}

// set geography if provided
const hashGeog = siteConfig.geographies.find((g) => (g.id === getHash(1)));
if (hashGeog) {
  appState.geography = hashGeog;
}

// set selected if provided
const hashSelected = getHash(2) ? getHash(2).split(',') : false;
if (hashSelected && hashSelected.constructor === Array) {
  appState.selected = hashSelected;
}

// grab initial data and use the first available geography for this metric.
fetchData(appState, metricId, null);

// Component data setup
Sidenav.data = function() {
  return {
    privateState: {
      data: dataConfig,
      filterVal: null
    },
    sharedState: appState
  };
};
Metadata.data = function() {
  return {
    sharedState: appState,
    privateState: {
      model: model
    }
  };
};

YearControl.data = function() {
  return {
    sharedState: appState,
    privateState: {
      playToggle: null
    }
  };
};
EmbedCode.data = function() {
  return {
    sharedState: appState,
    privateState: {
      title: null,
      qolembedURL: siteConfig.qolembedURL
    }
  };
};
DataTable.data = function() {
  return {
    sharedState: appState,
    privateState: {
      neighborhoodDescriptor: siteConfig.neighborhoodDescriptor,
      neighborhoodDefinition: siteConfig.neighborhoodDefinition
    }
  };
};
TrendChart.data = function() {
  return {
    sharedState: appState,
    privateState: {
      chart: null
    }
  };
};
Footer.data = function() {
  return {
    sharedState: appState,
    privateState: {
      links: siteConfig.links
    }
  };
};

Feedback.data = function() {
  return {
    privateState: {
      feedbackUrl: siteConfig.feedbackUrl,
      signupEmbed: siteConfig.signupEmbed,
      showSignup: false,
    }
  };
};
Social.data = function() {
  return {
    sharedState: appState,
    privateState: {
      links: siteConfig.links
    }
  };
};
Tabs.data = function() {
  return {
    sharedState: appState,
    privateState: {
      data: dataConfig,
      filterVal: null
    }
  };
};
DistributionChart.data = function() {
  return {
    sharedState: appState,
    privateState: {
      chart: null,
      chartData: null,
      median: null
    }
  };
};
ToC.data = function() {
  return {
    sharedState: appState,
    privateState: {
      metaDesc: null,
      selected: null,
      area: null,
      selectedRaw: null,
      areaRaw: null
    }
  };
};
MapGL.data = function() {
  return {
    sharedState: appState,
    privateState: {
      locate: null,
      mapboxAccessToken: privateConfig.mapboxAccessToken,
      mapOptions: {
        container: 'map',
        style: mapConfig.style,
        attributionControl: false,
        zoom: mapConfig.zoom,
        center: mapConfig.center,
        maxBounds: mapConfig.maxBounds,
        minZoom: mapConfig.minZoom,
        preserveDrawingBuffer: mapConfig.preserveDrawingBuffer
      },
      mapLoaded: false,
      metricId: null,
      geoJSON: null,
      isPitched3D: false,
      locationPopup: null,
      neighborhoodsBefore: mapConfig.neighborhoodsBefore,
      neighborhoodsSelectedBefore: mapConfig.neighborhoodsSelectedBefore,
      mapGeographyId: null,
      geographies: siteConfig.geographies,
    }
  };
};

GeographySwitcher.data = function() {
  return {
      sharedState: appState,
      privateState: {
        data: dataConfig,
        geographies: siteConfig.geographies,
      }
  }
};

// pass newly created mdl elements through mdl
//Vue.directive('mdl', {
//    bind: function(el) {
//        componentHandler.upgradeElement(el);
//    }
//});

// initialize components
new Vue({
  el: 'sc-tabs',
  render: h => h(Tabs)
});
new Vue({
  el: 'sc-sidenav',
  render: h => h(Sidenav)
});
new Vue({
  el: 'sc-metadata',
  render: h => h(Metadata)
});
new Vue({
  el: 'sc-years',
  render: h => h(YearControl)
});
new Vue({
  el: 'sc-datatable',
  render: h => h(DataTable)
});
new Vue({
  el: 'sc-distributionchart',
  render: h => h(DistributionChart)
});
new Vue({
  el: 'sc-trendchart',
  render: h => h(TrendChart)
});
new Vue({
  el: 'sc-toc',
  render: h => h(ToC)
});
new Vue({
  el: 'sc-embedcode',
  render: h => h(EmbedCode)
});
new Vue({
  el: 'sc-map',
  render: h => h(MapGL)
});
new Vue({
  el: 'sc-footer',
  render: h => h(Footer)
});
new Vue({
  el: 'sc-social',
  render: h => h(Social)
});
new Vue({
  el: 'sc-feedback',
  render: h => h(Feedback)
});
// offline message
new Vue({
  el: 'sc-offline',
  render: h => h(Offline)
});

// Geography switcher
new Vue({
    el: 'sc-geography-switcher',
    render: h => h(GeographySwitcher)
});


UndermapButtons.data = function() {
  return {
    sharedState: appState,
    privateState: {
      qolEmbedURL: siteConfig.hasOwnProperty('qolEmbedURL') ?
          siteConfig.qolEmbedURL :
          false,
      qolReportURL: siteConfig.qolreportURL,
    }
  }
};

// Undermap buttons
new Vue({
  el: 'sc-undermap-buttons',
  render: h => h(UndermapButtons)
})

////////////////////////////////////////////////////////////////////////////
// General non-component page interactions
///////////////////////////////////////////////////////////////////////////

// change metric from meta links
window.changeMetric = function(m) {
  let metric = m.replace('m', '');
  replaceState(metric, appState.selected, appState.geography.id);
  gaEvent(
    'metric',
    dataConfig[`m${metric}`].title.trim(),
    dataConfig[`m${metric}`].category.trim()
  );
  fetchData(appState, metric);
  scrollTo(document.querySelector('.mdl-layout__content'), 0, 600);
};

// what's new links
let whatsnew = document.querySelectorAll('span[data-whatsnew]');
let whatsnew_array = [...whatsnew];
whatsnew_array.forEach(link => {
  link.addEventListener('click', function() {
    let metric = link.getAttribute('data-whatsnew');
    replaceState(metric, appState.selected, appState.geography.id);
    gaEvent(
      'metric',
      dataConfig[`m${metric}`].title.trim(),
      dataConfig[`m${metric}`].category.trim()
    );
    fetchData(appState, metric);
    scrollTo(document.querySelector('.mdl-layout__content'), 0, 600);
  });
});

// contact form
let contactForm = document.querySelector('#contact-submit');
if (contactForm) {
  contactForm.addEventListener('click', function() {
    let message = document.querySelector('#contact-message');
    let email = document.querySelector('#contact-email');

    if (message.checkValidity() && email.checkValidity()) {
      axios
        .post(
          siteConfig.contactForm,
          querystring.stringify({
            email: email.value,
            url: window.location.href,
            agent: navigator.userAgent,
            subject: 'Quality of Life Dashboard Feedback',
            to: 'tobin.bradley@gmail.com',
            message: message.value
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
        .then(function() {
          document.querySelector('.comment-form').style.display = 'none';
          document.querySelector('.comment-complete').style.display = 'block';
        });
    }
  });
}
