/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import _ from 'lodash';
import async from 'async';
import fs from 'fs';
import jsonminify from 'jsonminify';
import md5 from 'js-md5';
import path from 'path';
import stringify from 'csv-stringify';

import siteConfig from '../data/config/site.js';
import dataConfig from '../data/config/data.js';
import metricCalculations from '../src/js/modules/metric_calculations.js';

const { calcValue } = metricCalculations;

const dest = './public/data/';

// /////////////////////////////////////////////////
// Create destination folders
// /////////////////////////////////////////////////
const directoriesToMake = ['', 'data', 'data/report', 'download'];
_.each(siteConfig.geographies, (geography) => {
  directoriesToMake.push(`data/report/${geography.id}`);
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

const allGeographyMetricsCached = {}; // All metric values for current geography.
const countyAverages = {}; // All county averages for all metrics.

// Create one big array of each unique metric, geography level pair that we can iterate through.
const metricGeographyPairs = siteConfig.geographies.flatMap(geography => Object.values(dataConfig)
  .filter(m => (m.geographies.indexOf(geography.id) > -1))
  .map(metric => ({ geography, metric })));

async.each(metricGeographyPairs, (pair, callback) => {
  const { geography, metric } = pair;
  if (!(geography.id in allGeographyMetricsCached)) {
    allGeographyMetricsCached[geography.id] = {};
  }

  const geographyMetricsCached = allGeographyMetricsCached[geography.id];
  fs.readFile(
    path.join(dest, `metric/${geography.id}/m${metric.metric}.json`),
    (err, data) => {
      let contents = {};
      if (err) {
        console.log(
          `Error reading ${dest}/metric/${geography.id}/m${metric.metric}.json: ${err.message}`,
        );
        return callback(err);
      }
      try {
        contents = JSON.parse(data);
      } catch (exception) {
        console.log(
          `Error parsing ${dest}/metric/${geography.id}/m${metric.metric}.json: ${exception.message}`,
        );
        return callback(exception);
      }
      _.forOwn(contents.map, (value, key) => {
        if (!(key in geographyMetricsCached)) {
          geographyMetricsCached[key] = {};
        }
        geographyMetricsCached[key][metric.metric] = {
          map: value,
        };
        if ('w' in contents) {
          geographyMetricsCached[key][metric.metric].w = contents.w[key];
        }
      });

      // Use worldval for county average if it is set in config/data.js.
      if ('world_val' in metric) {
        if (!(metric.metric in countyAverages)) {
          countyAverages[metric.metric] = _.mapKeys(metric.world_val, (value, key) => key.replace('y_', ''));
        }
      }

      // Otherwise, compute and store county averages.
      // Prefer tract over blockgroup data for calculating averages.
      else if (geography.id === 'tract' || geography.id === 'blockgroup'
            && !(metric.metric in countyAverages)) {
        const geographyKeys = Object.keys(contents.map);

        // Get the maximal set of years across all the tracts
        const years = geographyKeys.reduce(
          (y, currentValue) => (
            new Set([
              ...Object.keys(contents.map[currentValue])
                .map(y => (y.replace('y_', '')))
                .sort(),
              ...y,
            ])), [],
        );
        countyAverages[metric.metric] = {};
        years.forEach((year) => {
          countyAverages[metric.metric][year] = calcValue(contents,
            metric.type,
            year, geographyKeys);
        });
      }

      callback();
    },
  );
},
(err) => {
  if (err) {
    console.log(`Error on looping through metrics: ${err.message}`,
    );
  } else {
    // Write County Averages.
    fs.writeFile(path.join(dest, 'report/county_averages.json'),
      jsonminify(JSON.stringify(countyAverages)), (err2) => {
        if (err2) {
          return console.log(
            `Error writing county_averages.json: ${err2.message}`,
          );
        }
        console.log('Saved county averages json file');
      });

    // Write geography files for each geography level (tract, blockgroup).
    async.each(siteConfig.geographies, (geography, callback) => {

      // Write a file for each distinct geography at this level with just the metrics for that geography.
      // TODO: This could be made async as well.
      _.forOwn(allGeographyMetricsCached[geography.id], (value, key) => {
        let filename = key;
        if (geography.id === 'neighborhood') {
          filename = md5(key);
        }
        fs.writeFile(path.join(dest, `report/${geography.id}/${filename}.json`),
          jsonminify(
            JSON.stringify(Object.assign({'geography_name': key}, value))),
          (err2) => {
            if (err2) {
              return console.log(
                `Error saving report JSON for ${geography.id} ${filename} (${key}): ${err2.message}`);
            }
            console.log(
              `Saved report JSON for ${geography.id} ${filename} (${key})`);
          });
      });

      // Set up output file stream to CSV
      const dataFile = fs.createWriteStream(
        `public/download/DurhamNeighborhoodCompass-${geography.id}.csv`,
      );
      dataFile.on('finish', () => {
        console.log(`Wrote downloadable CSV file for ${geography.id}`);
      });
      dataFile.on('error', (err) => {
        console.error(err.message);
      });

      const dataCSV = stringify({delimiter: ','});
      dataCSV.on('error', (err) => {
        console.error(err.message);
      });
      dataCSV.pipe(dataFile);

      // Set up output file stream to CSV
      const weightsFile = fs.createWriteStream(
        `public/download/DurhamNeighborhoodCompass-${geography.id}-weights.csv`,
      );
      weightsFile.on('finish', () => {
        console.log(`Wrote downloadable weights CSV file for ${geography.id}`);
      });
      weightsFile.on('error', (err) => {
        console.error(err.message);
      });

      const weightsCSV = stringify({delimiter: ','});
      weightsCSV.on('error', (err) => {
        console.error(err.message);
      });
      weightsCSV.pipe(weightsFile);

      // Create CSV table for data output.
      let metricsList = null;
      _.forOwn(allGeographyMetricsCached[geography.id],
        (geographyData, geographyId) => {
            if (!metricsList) {
              metricsList = [];
              // Use the first geography to populate header row with names of metrics & the years they contain.
              _.forOwn(geographyData, (value, key) => {
                if (!value.map) {
                  console.log(`Error on ${key} ${value}`);
                } else {
                  metricsList.push({
                    metric: key,
                    years: Object.keys(value.map),
                  });
                }
              });

              // Now generate the human readable header row for the CSV table.
              const headerRow = _.flatMap(metricsList,
                  metric => _.map(metric.years,
                      year => `${dataConfig[`m${metric.metric}`].title}, ${
                          year.slice(-4)}`));
              headerRow.unshift('Geography Id', 'Geography Label');

              dataCSV.write(headerRow);
              weightsCSV.write(headerRow.map((label, index) => {
                if (index < 2) return label;
                return `Weight for ${label}`;
              }));
            }

            // Then spit out one giant row for each geography with each metric value for each year, in order.
            const dataRow = [geographyId, geography.label(geographyId)];
            const weightsRow = [geographyId, geography.label(geographyId)];
            _.forEach(metricsList, (metric) => {
              const prefix = dataConfig[`m${metric.metric}`].prefix || '';
              const suffix = dataConfig[`m${metric.metric}`].suffix || '';
              _.forEach(metric.years, (year) => {
                // Write metric data.
                if (metric.metric in geographyData && year in
                    geographyData[metric.metric].map &&
                    geographyData[metric.metric].map[year]) {
                  dataRow.push(
                      `${prefix}${geographyData[metric.metric].map[year]}${suffix}`);
                } else {
                  dataRow.push(null);
                }

                // Write weights file.
                if (metric.metric in geographyData && 'w' in
                    geographyData[metric.metric] && year in
                    geographyData[metric.metric].w &&
                    geographyData[metric.metric].w[year]) {
                  weightsRow.push(geographyData[metric.metric].w[year]);
                } else {
                  weightsRow.push(null);
                }
              });
            });
            dataCSV.write(dataRow);
            weightsCSV.write(weightsRow);
          });
      dataCSV.end();
      weightsCSV.end();
      callback();
    }, (err2) => {
      if (err2) {
        console.log(
            `Error on looping through metrics: ${err2.message}`,
        );
      }
    });
  }
});

// Write the data config to a readable spreadsheet
const dataFile = fs.createWriteStream(
  `public/download/DurhamNeighborhoodCompass-DataDictionary.csv`,
);
dataFile.on('finish', () => {
  console.log(`Wrote data dictionary file`);
});
dataFile.on('error', (err) => {
  console.error(err.message);
});

const dataCSV = stringify({ delimiter: ',' });
dataCSV.on('error', (err) => {
  console.error(err.message);
});
dataCSV.pipe(dataFile);

dataCSV.write(['Metric title', 'Metric title (es)', 'Metric category', 'Metric code', 'Aggregation type', 'Label for the value', 'Label for the raw value (value * weight)', 'Geographies available', 'Metadata link']);

Object.values(dataConfig)
  .sort((a, b) => {
    if (a.title < b.title) return -1;
    if (b.title < a.title) return 1;
    return 0;
  })
  .forEach((m) => {
    dataCSV.write([
      m.title,
      m.title_es,
      m.category,
      m.metric,
      m.type,
      m.label,
      m.raw_label,
      m.geographies.join(', '),
      `${siteConfig.qoldashboardURL}data/meta/m${m.metric}.html`,
    ]);
  });
dataCSV.end();
