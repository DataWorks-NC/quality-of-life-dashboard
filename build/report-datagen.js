const fs = require('fs');
const path = require('path');
const jsonminify = require("jsonminify");
const _ = require('lodash');
const async = require('async');

const dest = './public/data/';
const md5 = require('js-md5');
const stringify = require('csv-stringify');
const dataConfig = require('../data/config/data.js');
const siteConfig = require('../data/config/site.js');
const metric_calculations = require('../app/js/modules/metric_calculations.js');

const calcValue = metric_calculations.calcValue;

// /////////////////////////////////////////////////
// Create destination folders
// /////////////////////////////////////////////////
const directoriesToMake = ['', 'data', 'data/report', 'download'];
_.each(siteConfig.geographies, (geography) => {
  directoriesToMake.push(`data/report/${  geography.id}`);
});
directoriesToMake.forEach((name) => {
  try {
    fs.mkdirSync(`public/${name}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.log(`Error making directory public/${name}: ${err.message}`);
    }
  }
});

// /////////////////////////////////////////////
// Create report-specific JSON files.
// /////////////////////////////////////////////

_.each(siteConfig.geographies || ['geography'], (geography) => {

  // Cache metrics json files.
  // TODO: Filter out metrics which don't appear in the report to save filesize.
  const metrics = Object.values(dataConfig).
      filter(m => (m.geographies.indexOf(geography.id) > -1));
  const geographyMetricsCached = {};
  const countyAverages = {};

  async.each(metrics, (metric, callback) => {
    fs.readFile(
        path.join(dest, `metric/${geography.id}/m${metric.metric}.json`),
        (err, data) => {
          let contents = {};
          if (err) {
            console.log(
                `Error reading ${dest}/metric/${geography.id}/m${metric.metric}.json: ${err.message}`);
            return callback();
          }
          try {
            contents = JSON.parse(data);
          } catch (err) {
            console.log(
                `Error parsing ${dest}/metric/${geography.id}/m${metric.metric}.json: ${err.message}`);
            return callback();
          }
          _.forOwn(contents.map, (value, key) => {
            if (!geographyMetricsCached.hasOwnProperty(key)) {
              geographyMetricsCached[key] = {};
            }
            geographyMetricsCached[key][metric.metric] = {
              map: value,
            };
            if (contents.hasOwnProperty('w')) {
              geographyMetricsCached[key][metric.metric].w = contents.w[key];
            }
          });

          // Use worldval for county average if it is set in config/data.js.
          if (metric.hasOwnProperty('world_val')) {
            if (!countyAverages.hasOwnProperty(metric.metric)) {
              countyAverages[metric.metric] = metric.world_val;
            }
          }

          // Otherwise, compute and store county averages.
          // Prefer tract over blockgroup data for calculating averages.
          else if (geography.id === 'tract' || geography.id === 'blockgroup' &&
              !countyAverages.hasOwnProperty(metric.metric)) {
            const geographyKeys = Object.keys(contents.map);
            // Get the maximal set of years across all the tracts
            const years = geographyKeys.reduce(
                (years, currentValue) => (
                    new Set([
                      ...Object.keys(contents.map[currentValue]).
                          map(y => (y.replace('y_', ''))).
                          sort(),
                      ...years,
                    ])), [],
            );
            countyAverages[metric.metric] = {};
            years.forEach((year) => {
              countyAverages[metric.metric][`y_${year}`] = calcValue(contents,
                  metric.type,
                  year, geographyKeys);
            });
          }

          callback();
        });
  },
  (err) => {
    if (err) {
      console.log(
          `Error on looping through metrics: ${err.message}`);
    } else {

      fs.writeFile(path.join(dest, 'report/county_averages.json'),
          jsonminify(JSON.stringify(countyAverages)), (err) => {
            if (err) return console.log(
                `Error writing county_averages.json: ${err.message}`);
            console.log('Saved county averages json file');
          });

      // Write a file for each geography with just the metrics for that geography.
      // _.forOwn(geographyMetricsCached, (value, key) => {
      //   value.geography_name = key;
      //   let filename = key;
      //   if (geography.id === 'neighborhood') {
      //     filename = md5(key);
      //   }
      //   fs.writeFile(path.join(dest, `report/${geography.id}/${filename}.json`),
      //     jsonminify(JSON.stringify(value)),
      //     (err) => {
      //       if (err) return console.log(`Error saving report JSON for ${geography.id} ${filename} (${key}): ${err.message}`);
      //       console.log(`Saved report JSON for ${geography.id} ${filename} (${key})`);
      //     });
      // });

      // Set up output file stream to CSV
      const dataFile = fs.createWriteStream(
          `public/download/${geography.id}.csv`);
      dataFile.on('finish', function() {
        console.log(`Wrote downloadable CSV file for ${geography.id}`);
      });
      dataFile.on('error', function(err) {
        console.error(err.message);
      });

      const dataCSV = stringify({delimiter: ','});
      dataCSV.on('error', function(err) {
        console.error(err.message);
      });
      dataCSV.pipe(dataFile);

      // Set up output file stream to CSV
      const weightsFile = fs.createWriteStream(
          `public/download/${geography.id}-weights.csv`);
      weightsFile.on('finish', function() {
        console.log(`Wrote downloadable weights CSV file for ${geography.id}`);
      });
      weightsFile.on('error', function(err) {
        console.error(err.message);
      });

      const weightsCSV = stringify({delimiter: ','});
      weightsCSV.on('error', function(err) {
        console.error(err.message);
      });
      weightsCSV.pipe(weightsFile);

      // Create CSV table for data output.
      let metricsList = null;
      _.forOwn(geographyMetricsCached, (geographyData, geographyId) => {
        if (!metricsList) {
          metricsList = [];

          // Use the first geography to populate header row with names of metrics & the years they contain.
          _.forOwn(geographyData, (value, key) => {
            metricsList.push({
              metric: key,
              years: Object.keys(value.map),
            });
          });

          // Now generate the human readable header row for the CSV table.
          const headerRow = _.flatMap(metricsList, metric => _.map(metric.years,
              year => dataConfig[`m${metric.metric}`].title + ", " +
                  year.slice(-4)));
          headerRow.unshift('Geography Id', 'Geography Label');

          dataCSV.write(headerRow);
          weightsCSV.write(headerRow);
        }

        // Then spit out one giant row for each geography with each metric value for each year, in order.
        const dataRow = [geographyId, geography.label(geographyId)];
        const weightsRow = [geographyId, geography.label(geographyId)];
        _.forEach(metricsList, (metric) => {
          const prefix = dataConfig[`m${metric.metric}`].prefix || '';
          const suffix = dataConfig[`m${metric.metric}`].suffix || '';
          _.forEach(metric.years, (year) => {
            // Write metric data.
            if (metric.metric in geographyData && year in geographyData[metric.metric].map && geographyData[metric.metric].map[year]) {
                dataRow.push(`${prefix}${geographyData[metric.metric].map[year]}${suffix}`);
            } else {
              dataRow.push(null);
            }

            // Write weights file.
            if (metric.metric in geographyData && 'w' in geographyData[metric.metric] && year in geographyData[metric.metric].w && geographyData[metric.metric].w[year]) {
              weightsRow.push(geographyData[metric.metric].w[year]);
            } else {
              weightsRow.push(null);
            }
          })
        });
        dataCSV.write(dataRow);
        weightsCSV.write(weightsRow);
      });
      dataCSV.end();
      weightsCSV.end();
    }
  });
});
