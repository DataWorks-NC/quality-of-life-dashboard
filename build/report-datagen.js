const fs = require('fs');
const path = require('path');
const jsonminify = require("jsonminify");
const dataConfig = require('../data/config/data.js');
const siteConfig = require('../data/config/site.js');
const _ = require('lodash');
const async = require('async');
const dest = './public/data/';
const { calcValue } = require('../app/js/modules/metric_calculations.js');

///////////////////////////////////////////////
// Create report-specific JSON files.
///////////////////////////////////////////////

_.each(siteConfig.geographies || ['geography',], function(geography) {
  // Cache metrics json files.
  let metrics = Object.values(dataConfig).
      filter((m) => (m.geographies.indexOf(geography.id) > -1));
  let geographyMetricsCached = {};
  let countyAverages = {};

  async.each(metrics, (metric, callback) => {
    fs.readFile(path.join(dest, `metric/${geography.id}/m${metric.metric}.json`),
        (err, data) => {
          if (err) {
            console.log(err.message);
            return callback();
          }
          try {
            contents = JSON.parse(data);
          }
          catch (err) {
            console.log(err.message);
            return callback();
          }
          _.forOwn(contents.map, (value, key) => {
            if (!geographyMetricsCached.hasOwnProperty(key)) {
              geographyMetricsCached[key] = {};
            }
            geographyMetricsCached[key][metric.metric] = value;
          });

          // If this is the tract-level data, store county averages.
          if (geography.id === 'tract') {
            const geographyKeys = Object.keys(contents.map);

            // Get the maximal set of years across all the tracts
            const years = geographyKeys.reduce((years, currentValues) => (new Set([...Object.keys(currentValues), ...years])), []);
            countyAverages[metric.metric] = calcValue(contents, metric.type, years, geographyKeys);
            console.log(countyAverages[metric.metric]);
          }
          callback();
        });
    },
    (err) => {
      if (err) console.log(err.message);

      // Write a file for each geography with just the metrics for that geography.
      _.forOwn(geographyMetricsCached, (value, key) => {
        fs.writeFile(path.join(dest, `report/${geography.id}/${key}.json`),
            jsonminify(JSON.stringify(value)),
            (err) => {
              if (err) return console.log(err.message);
              console.log(`Saved report JSON for ${geography.id} ${key}`)
            });
      });
    }
  );
});