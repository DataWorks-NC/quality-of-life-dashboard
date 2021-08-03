/* eslint-disable no-console,import/no-extraneous-dependencies,import/extensions */
import fs from 'fs';
const fsPromises = fs.promises;
import path from 'path';
import jsonminify from 'jsonminify';
import csv from 'csvtojson';
import _ from 'lodash';
import marked from 'marked';
import dataConfig from '../data/config/data.js';
import siteConfig from '../data/config/site.js';

const dest = './public/data/metric';

// /////////////////////////////////////////////////
// Create destination folders
// /////////////////////////////////////////////////
const directoriesToMake = [
  '',
  'data',
  'data/meta',
  'data/meta/en',
  'data/meta/es',
  'data/metric'];
_.each(siteConfig.geographies, (geography) => {
  directoriesToMake.push(`data/metric/${geography.id}`);
});
directoriesToMake.forEach((name) => {
  try {
    fs.mkdirSync(`public/${name}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.log(`Error on creating directory ${name}: ${err.message}`);
    }
  }
});

// ////////////////////////////////////////////////
// Copy download, geography, style
// ////////////////////////////////////////////////

// Note: Selectgroups.geojson.json is processed by Webpack file-loader and hot-loaded.
// TODO: Long-term, would be ideal to do this for other geojson files as well.

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
            label: g.properties.label ?
              g.properties.label
              : geography.label(g.properties.id),
            label_es: g.properties.label_es ?
              g.properties.label_es
              : geography.label_es(g.properties.id),
          };
        }
        return g;
      });

      data = JSON.stringify(data);
      try {
        await fsPromises.writeFile(`public/data/${geography.id}.geojson.json`,
          jsonminify(data));
        console.log(`Saved and minified geojson for ${geography.name}`);
      } catch (err) {
        return console.log(`Error writing minified geojson for ${geography.name}: ${err2.message}`);
      }
    } catch (err) {
      return console.log(`Error on ${geography.name}: ${err.message}`);
    }
  }
  ));

// return true if convertable to number
function isNumeric(n) {
  // eslint-disable-next-line no-restricted-globals
  return !isNaN(parseFloat(n)) && isFinite(n);
}

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
              return fsPromises.writeFile(outFile, content).then(() => {console.log(`Wrote ${outFile}`); });
            } catch (err) {
              return console.log(`Error on writing ${outFile}: ${err.message}`);
            }
          } catch (err) {
            return console.log(`Error on running marked: ${err.message}`);
          }
        } catch (err) {
          return console.log(
            `Error on reading ${path.join(src, filePath)} ${err.message}`
          );
        }
      }
    }));
  }
  catch (err) {
    console.log(`Error on reading /data/meta: ${err.message}`);
  }
}));

// /////////////////////////////////////////////
// CSVtoJSON
// /////////////////////////////////////////////

// transform csv2json array to id: {y_2012: value} object format
function jsonTransform(jsonArray) {
  const jsonOut = {};
  for (let i = 0; i < jsonArray.length; i++) {
    jsonOut[jsonArray[i].id] = {};
    Object.keys(jsonArray[i]).forEach(key => {
      if (key !== 'id') {
        if (isNumeric(jsonArray[i][key])) {
          jsonOut[jsonArray[i].id][key] = Number(jsonArray[i][key]);
        } else {
          jsonOut[jsonArray[i].id][key] = null;
        }
      }
    });
  }
  return jsonOut;
}

async function writeMetricFile(destPath, metric, json) {
  const outFile = path.join(destPath, `m${metric.metric}.json`);
  return fsPromises.writeFile(
    outFile, jsonminify(JSON.stringify(json, null, '  ')))
    .catch((err) => console.log(`Error on writing ${outFile}: ${err.message}`))
  .then(() => console.log(`Wrote ${outFile}`));
}

async function convertMetricCsvToJson(geography, metric) {
  const basePath = path.join('data/metric', geography);
  const destPath = path.join(dest, geography);
  if (metric.type === 'sum' || metric.type === 'mean') {
    const prefix = (metric.type === 'sum' ? 'r' : 'n');
    try {
      const jsonObj = await csv().fromFile(path.join(basePath, `${prefix}${metric.metric}.csv`));
      const outJSON = {};
      outJSON.map = jsonTransform(jsonObj);

      if (metric.accuracy) {
        try {
          const jsonObjA = await csv().fromFile(path.join(basePath,
            `${prefix}${metric.metric}-accuracy.csv`));
          outJSON.a = jsonTransform(jsonObjA);
        } catch (error) {
          console.log(
            `Error parsing ${prefix}${metric.metric}-accuracy.csv for ${geography}: ${error.message}`);
        }
      }
      return writeMetricFile(destPath, metric, outJSON);
    } catch (error) {
      console.log(`Error parsing ${prefix}${metric.metric}.csv for ${geography}: ${error.message}`);
    }
  }

  if (metric.type === 'weighted') {
    const outJSON = {};
    const [jsonObj, jsonObjD] = await Promise.all([csv().
      fromFile(path.join(basePath, `r${metric.metric}.csv`)), csv().
      fromFile(path.join(basePath, `d${metric.metric}.csv`))]);
    const jsonArrayR = jsonTransform(jsonObj);
    const jsonArrayD = jsonTransform(jsonObjD);
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
      return console.log(
        `Error on ${metric.metric} for ${geography}: ${err.message}`
      );
    }
    outJSON.w = jsonArrayD;
    outJSON.map = jsonArrayR;
    if (metric.accuracy) {
      try {
        const jsonObjA = await csv().fromFile(path.join(basePath,
          `m${metric.metric}-accuracy.csv`));
        outJSON.a = jsonTransform(jsonObjA);
      } catch (error) {
        console.log(
          `Error parsing m${metric.metric}-accuracy.csv for ${geography}: ${error.message}`);
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
      async (geography) =>
          convertMetricCsvToJson(geography, metric).catch(err =>
           console.log(
            `Error running metricCsvToJson for ${geography}: ${err.message}`
          ))));
  } else if (metric) {
    return convertMetricCsvToJson('', metric);
  }
}));
