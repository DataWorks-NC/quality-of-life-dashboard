/* eslint-disable no-console */
import { each, forOwn, mapKeys, } from 'lodash-es';
import async from 'async';
import fs from 'fs';
import jsonminify from 'jsonminify';
import path from 'path';
import JSONstringify from 'json-stable-stringify';

import { calcValue } from '../src/js/modules/metric_calculations.js';
import generateDownloadCSVs from './download-datagen.js';

import siteConfigData from '../data/config/site.js';
import dataConfigData from '../data/config/data.js';
import md5 from 'js-md5';

const dataConfig = dataConfigData.default;
const siteConfig = siteConfigData.default;

const dest = './public/data/';

async function main() {
// /////////////////////////////////////////////////
// Create destination folders
// /////////////////////////////////////////////////
  const directoriesToMake = ['', 'data', 'data/report', 'download'];
  each(siteConfig.geographies, (geography) => {
    directoriesToMake.push(`data/report/${geography.id}`);
  });
  directoriesToMake.forEach((name) => {
    try {
      fs.mkdirSync(`public/${name}`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error(`Error making directory public/${name}: ${err.message}`);
      }
    }
  });

  // /////////////////////////////////////////////
  // Create report-specific JSON files.
  // /////////////////////////////////////////////

  const allGeographyMetricsCached = {}; // All metric values for current geography.
  const countyAverages = {}; // All county averages for all metrics.

  // Create one big array of each unique metric, geography level pair that we can iterate through.
  const metricGeographyPairs = siteConfig.geographies.flatMap(
    geography => Object.values(dataConfig)
      .filter(m => (m.geographies.indexOf(geography.id) > -1))
      .map(metric => ({ geography, metric })),
  );

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
          console.error(
            `Error reading ${dest}/metric/${geography.id}/m${metric.metric}.json: ${err.message}`,
          );
          return callback(err);
        }
        try {
          contents = JSON.parse(data);
        } catch (exception) {
          console.error(
            `Error parsing ${dest}/metric/${geography.id}/m${metric.metric}.json: ${exception.message}`,
          );
          return callback(exception);
        }
        forOwn(contents.map, (value, key) => {
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

        // Use worldval for county average when it is set in config/data.js.
        if (('world_val' in metric) && !(metric.metric in countyAverages)) {
          countyAverages[metric.metric] = mapKeys(metric.world_val,
            (value, key) => key.replace('y_', ''));
        }
        else if (!(metric.metric in countyAverages)) {
          countyAverages[metric.metric] = {};
        }

        // Otherwise, compute and store county averages.
        // Prefer tract over blockgroup data for calculating averages.
        if (geography.id === 'tract' || geography.id === 'blockgroup') {
          // Get the maximal set of years across all the geographies
          const geographyKeys = Object.keys(contents.map);
          const years = Array.from(geographyKeys.reduce(
            (y, currentValue) => (
              new Set([
                ...Object.keys(contents.map[currentValue]).map(year => (year.replace('y_', ''))).sort(),
                ...y,
              ])), [],
          )).filter(y => !(y in countyAverages[metric.metric]));

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
      console.error(`Error on looping through metrics: ${err.message}`);
    } else {
      // Write County Averages.
      fs.writeFile(path.join(dest, 'report/county_averages.json'),
        jsonminify(JSONstringify(countyAverages)), (err2) => {
          if (err2) {
            return console.error(
              `Error writing county_averages.json: ${err2.message}`,
            );
          }
          console.log('Saved county averages json file');
        });

      async.each(siteConfig.geographies, (geography) => {
        // Write a file for each distinct geography at this level with just the metrics for that geography.
        // TODO: This could be made async as well.
        forOwn(allGeographyMetricsCached[geography.id], (value, key) => {
          let filename = key;
          if (geography.id === 'neighborhood') {
            filename = md5(key);
          }
          fs.writeFile(path.join(dest, `report/${geography.id}/${filename}.json`),
            jsonminify(
              JSONstringify({'geography_name': key, ...value}),
            ),
            (err2) => {
              if (err2) {
                return console.error(
                  `Error saving report JSON for ${geography.id} ${filename} (${key}): ${err2.message}`,
                );
              }
              console.log(
                `Saved report JSON for ${geography.id} ${filename} (${key})`,
              );
            });
        });
      });

      generateDownloadCSVs(allGeographyMetricsCached);
    }
  });
}

main();
