import path from 'path';
import jsonminify from 'jsonminify';
import csv from 'csvtojson';
import {each } from 'lodash-es';
import { marked } from 'marked';
import stringify from 'json-stable-stringify';

import fs from 'fs';

// Weird workaround for command line use of this tool.
import siteConfigData from '../data/config/site.js';
import dataConfigData from '../data/config/data.js';

const dataConfig = dataConfigData.default;
const siteConfig = siteConfigData.default;

import {
  isNumeric,
  csvToJsonTransform,
  newFormatCsvToJsonTransform,
  writeMetricFile,
  checkMetricFileName,
} from './datagen-functions.js';

const fsPromises = fs.promises;

const dest = './public/data/metric';

// /////////////////////////////////////////////////
// Create destination folders
// /////////////////////////////////////////////////
const directoriesToMake = [
  '',
  'selectgroups',
  'data',
  'data/meta',
  'data/meta/en',
  'data/meta/es',
  'data/metric'];
  each(siteConfig.geographies, (geography) => {
  directoriesToMake.push(`data/metric/${geography.id}`);
});

async function main() {
  directoriesToMake.forEach((name) => {
    try {
      fs.mkdirSync(`public/${name}`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error(`Error on creating directory ${name}: ${err.message}`);
      }
    }
  });

  // ////////////////////////////////////////////////
  // Copy download, geography, style
  // ////////////////////////////////////////////////

  // Either loop through the geography IDs, or just copy geography.geojson.json.
  await Promise.all((siteConfig.geographies || ['geography']).map(
    async (geography) => {
      try {
        let data = await fsPromises.readFile(`data/${geography.id}.geojson.json`, 'utf8');

        // Add labels
        data = JSON.parse(data);
        data.features = data.features.map((g) => {
          if (!('label_en' in g.properties && 'label_es' in g.properties)) {
            g.properties = {
              ...g.properties,
              label: g.properties.label
                ? g.properties.label
                : geography.label(g.properties.id),
              label_es: g.properties.label_es
                ? g.properties.label_es
                : geography.label_es(g.properties.id),
            };
          }
          return g;
        });

        data = stringify(data);
        try {
          await fsPromises.writeFile(`public/data/${geography.id}.geojson.json`,
            jsonminify(data));
          console.log(`Saved and minified geojson for ${geography.name}`);
        } catch (err) {
          return console.error(
            `Error writing minified geojson for ${geography.name}: ${err.message}`,
          );
        }
      } catch (err) {
        return console.error(`Error on ${geography.name}: ${err.message}`);
      }
    },
  ));

  // Split selectgroups into one file for each select group.
  const selectGroupData = await fsPromises.readFile(`data/selectgroups.geojson.json`, 'utf8');
  const selectGroups = JSON.parse(selectGroupData);

  await Promise.all(selectGroups.features.map(async (f) => {
    // Create new JSON object.
    const selectGroupGeoJSON = stringify({
      type: "FeatureCollection",
      name: "selectgroups",
      crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      features: [f,]
    });

    // Write to file.
    const filePath = `public/selectgroups/${encodeURIComponent(f.properties.id.replaceAll(' ', '_'))}.geojson.json`;
    return await fsPromises.writeFile(filePath, jsonminify(selectGroupGeoJSON));
  })).then(() => console.log('Wrote all selectgroups to separate geojson files'));

  // //////////////////////////////////////////////
  // Process Markdown Meta files into HTML
  // //////////////////////////////////////////////
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
  });

  await Promise.all(['data/meta/en', 'data/meta/es'].map(async (src) => {
    try {
      const files = await fsPromises.readdir(`./${src}`);
      return Promise.all(files.map(async (filePath) => {
        if (path.basename(filePath).split('.')[1] === 'md') {
          try {
            const data = await fsPromises.readFile(path.join(src, filePath), 'utf-8');

            const outFile = `${path.join('public', src,
              path.basename(filePath).split('.')[0])}.html`;

            try {
              const content = marked(data);
              try {
                return fsPromises.writeFile(outFile, content).then(() => {
                  console.log(`Wrote ${outFile}`);
                });
              } catch (err) {
                return console.error(`Error on writing ${outFile}: ${err.message}`);
              }
            } catch (err) {
              return console.error(`Error on running marked: ${err.message}`);
            }
          } catch (err) {
            return console.error(
              `Error on reading ${path.join(src, filePath)} ${err.message}`,
            );
          }
        }
      }));
    } catch (err) {
      console.error(`Error on reading /data/meta: ${err.message}`);
    }
  }));

  // /////////////////////////////////////////////
  // CSVtoJSON
  // /////////////////////////////////////////////
  async function convertMetricCsvToJson(geography, metric) {
    const destPath = path.join(dest, geography);

    if (metric.type === 'sum' || metric.type === 'mean') {
      let matchingFile = checkMetricFileName(geography, metric, (metric.type === 'sum' ? 'r' : 'n'));

      try {
        const outJSON = {};
        if (!matchingFile) {
          console.error(
            `Can't find metric CSV files for ${metric.metric}`,
          );
          return;
        }

        const jsonObj = await csv().fromFile(matchingFile.name);
        outJSON.map = matchingFile.format === 'new' ? newFormatCsvToJsonTransform(jsonObj) : csvToJsonTransform(jsonObj);

        if (metric.accuracy) {
          matchingFile = checkMetricFileName(geography, metric, 'accuracy');
          if (!matchingFile) {
            console.error(
              `Could not find matching accuracy file for ${metric.metric} for ${geography}.`,
            );
          }
          else {
            try {
              const jsonObjA = await csv().fromFile(matchingFile.name);
              outJSON.a = csvToJsonTransform(jsonObjA);
            } catch (error) {
              console.error(
                `Error parsing accuracy file for ${metric.metric} for ${geography}: ${error.message}`,
              );
            }
          }
        }
        return writeMetricFile(destPath, metric, outJSON);
      } catch (error) {
        console.error(
          `Error parsing ${matchingFile.name} for ${geography}: ${error.message}`,
        );
      }
    }

    if (metric.type === 'weighted') {
      const outJSON = {};
      const files = [checkMetricFileName(geography, metric, 'r'), checkMetricFileName(geography, metric, 'd')];

      const [jsonArrayR, jsonArrayD] = await Promise.all(files.map(async file => {
        const csvArray = await csv().fromFile(file.name);
        if (file.format === 'new') {
          return newFormatCsvToJsonTransform(csvArray);
        }
        return csvToJsonTransform(csvArray);
      }));

      try {
        Object.keys(jsonArrayR).forEach(key => {
          Object.keys(jsonArrayR[key]).forEach(key2 => {
            if (
              isNumeric(jsonArrayR[key][key2])
              && isNumeric(jsonArrayD[key][key2])
            ) {
              jsonArrayR[key][key2] /= jsonArrayD[key][key2];
              if (metric.suffix === '%') {
                jsonArrayR[key][key2] *= 100;
              }
            } else {
              jsonArrayR[key][key2] = null;
            }
          });
        });
      } catch (err) {
        return console.error(
          `Error on ${metric.metric} for ${geography}: ${err.message}`,
        );
      }
      outJSON.w = jsonArrayD;
      outJSON.map = jsonArrayR;
      if (metric.accuracy) {
        const accuracyFile = checkMetricFileName(geography, metric, 'accuracy');
        if (!accuracyFile) {
          console.error(
            `Could not find accuracy file for ${metric.metric} for ${geography}.`,
          );
        }
        else {
          try {
            const jsonObjA = await csv().fromFile(accuracyFile.name);
            outJSON.a = csvToJsonTransform(jsonObjA);
          } catch (error) {
            console.error(
              `Error parsing accuracy file for ${metric.metric} for ${geography}: ${error.message}`,
            );
          }
        }
      }
      return writeMetricFile(destPath, metric, outJSON);
    }
  }

  // Loop through geographies & variables.
  const siteGeographyIds = siteConfig.geographies.map(g => (g.id));
  await Promise.all(Object.values(dataConfig).map(async (metric) => {
    if (metric.geographies) {
      console.log(`Converting csvs to JSON for ${metric.metric}`);
      return Promise.all(
        metric.geographies.filter((g) => (siteGeographyIds.indexOf(g) !== -1)).map(
          async (geography) => convertMetricCsvToJson(geography, metric).catch(err => console.error(
            `Error running metricCsvToJson for ${metric.metric} at ${geography}: ${err.message}`,
          )),
        ),
      );
    }
    if (metric) {
      return convertMetricCsvToJson('', metric);
    }
  }));
}

main();
