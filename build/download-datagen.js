/* eslint-disable no-console */
import async from 'async';
import {flatMap, forEach, forOwn, map, filter, each} from 'lodash-es';
import fs from 'fs';
import {stringify} from 'csv-stringify';


import siteConfigData from '../data/config/site.js';
import dataConfigData from '../data/config/data.js';

const dataConfig = dataConfigData.default;
const siteConfig = siteConfigData.default;

const categories = Object.values(dataConfig).reduce((categoriesArray, curVal) => { if (categoriesArray.indexOf(curVal.category) === -1) categoriesArray.push(curVal.category); return categoriesArray; }, []);

const dest = './public/download/';


// /////////////////////////////////////////////////
// Export data for download to CSVs. This function runs as part of the report-datagen process
// to take advantage of the fact that by then all metric data has been loaded into memory.
// /////////////////////////////////////////////////
export default async function generateDownloadCSVs(allGeographyMetricsCached) {

  // /////////////////////////////////////////////////
  // Create destination folders
  // /////////////////////////////////////////////////
  const directoriesToMake = [];
  each(categories, (category) => {
    const categoryPath = category.replace(' ','_');
    directoriesToMake.push(`${dest}${categoryPath}/`);
  });
  directoriesToMake.forEach((name) => {
    try {
      fs.mkdirSync(`${name}`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error(`Error making directory ${name}: ${err.message}`);
      }
    }
  });

  async.each(categories, (category) => {
    const categoryPath = category.replace(' ','_');
    const validMetricsForCategory = filter(dataConfig, (value) => value.category === category).map(m => m.metric);

    async.each(siteConfig.geographies, (geography, callback) => {
      // Set up output file stream to CSV
      const dataFile = fs.createWriteStream(
        `${dest}${categoryPath}/DurhamNeighborhoodCompass-${categoryPath}-${geography.id}.csv`,
      );
      dataFile.on('finish', () => {
        console.log(`Wrote downloadable CSV file for ${geography.id} and category ${category}`);
      });
      dataFile.on('error', (err2) => {
        console.error(err2.message);
      });

      const dataCSV = stringify({delimiter: ','});
      dataCSV.on('error', (err2) => {
        console.error(err2.message);
      });
      dataCSV.pipe(dataFile);

      // Set up output file stream to CSV
      const weightsFile = fs.createWriteStream(
        `${dest}${categoryPath}/DurhamNeighborhoodCompass-${categoryPath}-${geography.id}-weights.csv`,
      );
      weightsFile.on('finish', () => {
        console.log(`Wrote downloadable weights CSV file for ${geography.id} and category ${category}`);
      });
      weightsFile.on('error', (err2) => {
        console.error(err2.message);
      });

      const weightsCSV = stringify({delimiter: ','});
      weightsCSV.on('error', (err2) => {
        console.error(err2.message);
      });
      weightsCSV.pipe(weightsFile);

      // Create CSV table for data output.
      let metricsList = null;
      forOwn(allGeographyMetricsCached[geography.id],
        (geographyData, geographyId) => {
          if (!metricsList) {
            metricsList = [];
            // Use the first geography to populate header row with names of metrics & the years they contain.
            forOwn(geographyData, (value, key) => {
              if (!validMetricsForCategory.includes(key)) {
                return;
              }
              if (!value.map) {
                console.error(`Error on ${key} ${value}`);
              } else {
                metricsList.push({
                  metric: key,
                  years: Object.keys(value.map),
                });
              }
            });

            // Now generate the human-readable header row for the CSV table.
            const headerRow = flatMap(metricsList,
              metric => map(metric.years,
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
          forEach(metricsList, (metric) => {
            const prefix = dataConfig[`m${metric.metric}`].prefix || '';
            const suffix = dataConfig[`m${metric.metric}`].suffix || '';
            forEach(metric.years, (year) => {
              // Write metric data.
              if (metric.metric in geographyData && year
                in geographyData[metric.metric].map
                && geographyData[metric.metric].map[year]) {
                dataRow.push(
                  `${prefix}${geographyData[metric.metric].map[year]}${suffix}`,
                );
              } else {
                dataRow.push(null);
              }

              // Write weights file.
              if (metric.metric in geographyData && 'w'
                in geographyData[metric.metric] && year
                in geographyData[metric.metric].w
                && geographyData[metric.metric].w[year]) {
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
        console.error(
          `Error on looping through metrics: ${err2.message}`,
        );
      }
    });
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

  const dataCSV = stringify({delimiter: ','});
  dataCSV.on('error', (err) => {
    console.error(err.message);
  });
  dataCSV.pipe(dataFile);

  dataCSV.write([
    'Metric title',
    'Metric title (es)',
    'Metric category',
    'Metric code',
    'Aggregation type',
    'Label for the value',
    'Label for the raw value (value * weight)',
    'Geographies available',
    'Metadata link']);

  Object.values(dataConfig).sort((a, b) => {
    if (a.title < b.title) return -1;
    if (b.title < a.title) return 1;
    return 0;
  }).forEach((m) => {
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
}
