import "@babel/polyfill";

import Vue from 'vue';

import { fetchResponseJSON } from './modules/fetch';
import config from './modules/config.js';

import {
  getHash,
} from './modules/tracking';
import ReportSummary from './components/report/report-summary';
import ReportBody from './components/report/report-body';
import ReportSelector from './components/report/report-selector';

import 'vueify/lib/insert-css'; // required for .vue file <style> tags

// to fix vue not including modules bug
import 'mapbox-gl';

const siteConfig = config.siteConfig;
const mapConfig = config.mapConfig;
const dataConfig = config.dataConfig;

const md5 = require('js-md5');

Vue.config.productionTip = false;

// TODO: Refactor this section of the code to be clearer!

// Process hashes
const areaIds = getHash(1).split(',').map(g => decodeURIComponent(g));
const geography = siteConfig.geographies.find(g => (g.id === getHash(0)));
const categoryNames = new Array(...new Set(Object.values(dataConfig).map(m => (m.category))));
const areaNames = areaIds.map(id => (siteConfig.geographies.find(g => (g.id === geography.id)).label(id)));

// Optional report title
let customTitle = getHash(2);

// Optional metric filtering
let visibleMetricList = getHash(3);
if (visibleMetricList === '') {
  visibleMetricList = false;
}
else {
  visibleMetricList = visibleMetricList.split(',');
}

// Initialize app state.
const appState = {
  categories: categoryNames.map((name) => {
    let tempCategory = {
        name: name,
        metrics: Object.values(dataConfig).filter((m) => (m.category === name && m.geographies.indexOf(geography.id) > -1)).map(m => Object.assign(m, { visible: !visibleMetricList || visibleMetricList.indexOf(m.metric) > -1 })),
        visible: true,
      };
    tempCategory.visible = !tempCategory.metrics.every(m => !m.visible);
    if (tempCategory.metrics.length > 0) {
      return tempCategory;
    }

      return false;

    }
  ).filter(m => (m)),
  metricValues: {},
  countyAverages: {},
  reportTitle: customTitle ? customTitle : areaNames.join(', '),
};

// Fill in skeleton structure of metricValues and countyAverages objects as categories -> metrics.
Object.values(dataConfig).forEach((metric) => {
  if (!appState.metricValues.hasOwnProperty(metric.category)) appState.metricValues[metric.category] = {};
  if (!appState.countyAverages.hasOwnProperty(metric.category)) appState.countyAverages[metric.category] = {};
  appState.metricValues[metric.category][metric.metric] = {};
  appState.countyAverages[metric.category][metric.metric] = {};
});

function loadReportSummary() {
  ReportSummary.data = function () {
    const data = {
      mapConfig,
      areaIds,
      areaNames,
      geographyId: geography.id,
      reportTitle: appState.reportTitle,
      summaryMetrics: siteConfig.summaryMetrics.map((id) => {
        const metric = dataConfig[id];
        if (appState.metricValues.hasOwnProperty(metric.category) && appState.metricValues[metric.category].hasOwnProperty(metric.metric)) {
          metric.value = Object.values(appState.metricValues[metric.category][metric.metric]).slice(-1)[0];
        }
        return metric;
      }),
    };
    Object.freeze(data.mapConfig);
    Object.freeze(data.areaIds);
    Object.freeze(data.areaNames);
    Object.freeze(data.summaryMetrics);
    return data;
  };

  return new Vue({
    el: 'report-summary',
    render: h => h(ReportSummary),
  });
}

function fetchReportData(geographyId, areaIds) {
  Promise.all(areaIds.map((id) => {
    let filename = id;
    if (geographyId === 'neighborhood') {
      filename = md5(id);
    }
    return Promise.resolve(fetchResponseJSON(`data/report/${geographyId}/${filename}.json`));
  })).then(
    function (args) {
      Object.keys(args[0]).forEach((key) => {
        if (key === 'geography_name') return;
        if (!dataConfig.hasOwnProperty(`m${key}`)) return console.log(`No data config found for ${  key}`);
        const metric = dataConfig[`m${key}`];
        const metricValues = {};
        Object.keys(args[0][key].map).forEach((year) => {
          if (metric.type === 'sum') {
            metricValues[year.replace('y_', '')] = args.reduce((prevVal, file) => (file[key].map[year] !== null ? prevVal + file[key].map[year] : prevVal), 0);
          } else if (metric.type === 'mean') {
            metricValues[year.replace('y_', '')] = args.reduce((prevVal, file) => (file[key].map[year] !== null ? prevVal + file[key].map[year] : prevVal), 0) / args.length;
          } else if (metric.type === 'weighted') {
            metricValues[year.replace('y_', '')] = args.reduce((prevVal, file) => (
              file[key] && file[key].w[year] !== null && file[key].map[year] !== null
                ? prevVal + file[key].map[year] * file[key].w[year]
                : prevVal), 0)
                / args.reduce((prevVal, file) => (file[key] && file[key].w[year] !== null ? prevVal + file[key].w[year] : prevVal), 0);
          }
        },
        );
        appState.metricValues[metric.category][key] = metricValues;
      });
      loadReportSummary();
    }
  );

  fetchResponseJSON('data/report/county_averages.json').then((data) => {
    Object.values(dataConfig).filter((m) => (m.geographies.indexOf(geographyId) > -1)).forEach((m) => {
      const key = m.metric;
      if (!dataConfig.hasOwnProperty(`m${key}`)) return console.log("No data config found for " + key);
      const category = dataConfig[`m${key}`].category;
      let countyAverages = {};
      if (data.hasOwnProperty(key)) {
        Object.keys(data[key]).forEach((year) => {
              countyAverages[year.replace('y_', '')] = data[key][year];
            }
        );
      }
      appState.countyAverages[category][key] = countyAverages;
    });
    Object.freeze(appState.countyAverages);
    Object.freeze(appState.metricValues);
  });
}

ReportBody.data = function () {
  return {
    categories: appState.categories,
    metricValues: appState.metricValues,
    countyAverages: appState.countyAverages,
  };
};

// Parse data config to get unique list of categories
const summaryMetrics = siteConfig.summaryMetrics.map((id) => dataConfig[id]);

new Vue({
  el: 'report-body',
  render: h => h(ReportBody),
});

ReportSelector.data = function () {
  return {
    reportTitle: appState.reportTitle,
    categories: appState.categories,
    hostName: window.location.host,
    baseUrl: siteConfig.qolreportURL,
    collapsed: true,
  };
};

new Vue({
  el: 'report-selector',
  render: h => h(ReportSelector),
});

fetchReportData(geography.id, areaIds);
