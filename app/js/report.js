require('es6-promise').polyfill(); // Fix for axios on IE11
require('./modules/ie-polyfill-array-from.js'); // fix for array from on IE11
require('material-design-lite');

import Vue from 'vue/dist/vue.js';
import axios from 'axios';
import dataConfig from '../../data/config/data';
import mapConfig from '../../data/config/map';
import siteConfig from '../../data/config/site';
import privateConfig from '../../data/config/private';
import colors from './modules/breaks';
import {
  replaceState,
  gaEvent,
  getHash,
  urlArgsToHash
} from './modules/tracking';
import scrollTo from './modules/scrollto';
import querystring from 'querystring';
import ReportSummary from './components/report/report-summary';
import ReportBody from './components/report/report-body';
import ReportMap from './components/report/report-map';
import ieSVGFixes from './modules/ie-svg-bugs.js';

import 'vueify/lib/insert-css'; // required for .vue file <style> tags

// to fix vue not including modules bug
import 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder';
import {scaleLinear} from 'd3-scale';

Vue.config.productionTip = false;

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// fix ie SVG bugs
ieSVGFixes();

// Parse data config to get unique list of categories
const summaryMetrics = siteConfig.summaryMetrics.map((id) => {
  let metric = dataConfig[id];
  metric.value = 1; // TODO
  return metric;
});

ReportSummary.data = function() {
  return {
    privateState: {
      summaryMetrics: summaryMetrics,
    }
  }
};

const categoryNames = new Array(...new Set(Object.values(dataConfig).map((m) => (m.category))));
const geographyId = 'neighborhood';
const areaId = 'Stadium Heights';

let appState = {
  categories: categoryNames.map((name) => {
      let tempCategory = {
          name: name,
          metrics: Object.values(dataConfig).filter((m) => (m.category === name && m.geographies.indexOf(geographyId) > -1))
        };
      if (tempCategory.metrics.length > 0) {
        return tempCategory;
      }
      else {
        return false;
      }
      }
  ).filter((m) => (m)),
  metricValues: {},
  countyAverages: {},
};

// Fill in skeleton structure of metricValues and countyAverages objects as categories -> metrics.
Object.values(dataConfig).forEach((metric) => {
  if (!appState.metricValues.hasOwnProperty(metric.category)) appState.metricValues[metric.category] = {};
  if (!appState.countyAverages.hasOwnProperty(metric.category)) appState.countyAverages[metric.category] = {};
  appState.metricValues[metric.category][metric.metric] = {};
  appState.countyAverages[metric.category][metric.metric] = {};
});

function fetchReportData(geographyId, areaId) {
  axios.get(`data/report/${geographyId}/${areaId}.json`).then(function(data) {
    Object.keys(data.data).forEach((key) => {
      const category = dataConfig[`m${key}`].category;
      let metricValues = {};
      Object.keys(data.data[key]).forEach((year) => {
            metricValues[year.replace('y_', '')] = data.data[key][year];
          }
      );
      appState.metricValues[category][key] = metricValues;
    });
  });

  axios.get('data/report/county_averages.json').then(function(data) {
    Object.keys(data.data).forEach((key) => {
      const category = dataConfig[`m${key}`].category;
      let countyAverages = {};
      Object.keys(data.data[key]).forEach((year) => {
            countyAverages[year.replace('y_', '')] = data.data[key][year];
          }
      );
      appState.countyAverages[category][key] = countyAverages;
    });
  });
}

ReportBody.data = function() {
  return {
    categories: appState.categories,
    metricValues: appState.metricValues,
    countyAverages: appState.countyAverages,
  }
};

ReportMap.data = function() {
  return {}
};

new Vue({
  el: 'report-summary',
  render: h => h(ReportSummary)
});

new Vue({
  el: 'report-map',
  render: h => h(ReportMap),
});

new Vue({
  el: 'report-body',
  render: h => h(ReportBody),
});

fetchReportData(geographyId, areaId);
