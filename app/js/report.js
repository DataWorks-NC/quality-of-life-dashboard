require('es6-promise').polyfill(); // Fix for axios on IE11
require('./modules/ie-polyfill-array-from.js'); // fix for array from on IE11
require('material-design-lite');

import Vue from 'vue/dist/vue.js';
import axios from 'axios';
import dataConfig from '../../data/config/data';
import siteConfig from '../../data/config/site';
import {
  getHash,
} from './modules/tracking';
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

// Process hashes
const areaId = getHash(1)[0];
const geographyId = getHash(2);

const categoryNames = new Array(...new Set(Object.values(dataConfig).map((m) => (m.category))));

// Initialize app state.
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

function loadReportSummary() {
  ReportSummary.data = function() {
    return {
      areaName: siteConfig.geographies.find((g) => (g.id === geographyId)).label(areaId),
      summaryMetrics: siteConfig.summaryMetrics.map((id) => {
        let metric = dataConfig[id];
        if (appState.metricValues.hasOwnProperty(metric.category) && appState.metricValues[metric.category].hasOwnProperty(metric.metric)) {
          metric.value = Object.values(appState.metricValues[metric.category][metric.metric]).slice(-1)[0];
        }
        return metric;
      })
    }
  };

  return new Vue({
    el: 'report-summary',
    render: h => h(ReportSummary)
  });
}

function fetchReportData(geographyId, areaId) {
  axios.get(`data/report/${geographyId}/${areaId}.json`).then(function(data) {
    Object.keys(data.data).forEach((key) => {
      if (!dataConfig.hasOwnProperty(`m${key}`)) return console.log("No data config found for " + key);
      const category = dataConfig[`m${key}`].category;
      let metricValues = {};
      Object.keys(data.data[key]).forEach((year) => {
            metricValues[year.replace('y_', '')] = data.data[key][year];
          }
      );
      appState.metricValues[category][key] = metricValues;
    });

    loadReportSummary();
  });

  axios.get('data/report/county_averages.json').then(function(data) {
    Object.values(dataConfig).filter((m) => (m.geographies.indexOf(geographyId) > -1)).forEach((m) => {
      const key = m.metric;
      if (!dataConfig.hasOwnProperty(`m${key}`)) return console.log("No data config found for " + key);
      const category = dataConfig[`m${key}`].category;
      let countyAverages = {};
      if (data.data.hasOwnProperty(key)) {
        Object.keys(data.data[key]).forEach((year) => {
              countyAverages[year.replace('y_', '')] = data.data[key][year];
            }
        );
      }
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

// Parse data config to get unique list of categories
const summaryMetrics = siteConfig.summaryMetrics.map((id) => {
  return dataConfig[id];
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
