const fs = require('fs');
const path = require('path');
const jsonminify = require("jsonminify");
const dataConfig = require('../data/config/data.js');
const siteConfig = require('../data/config/site.js');
const csv = require('csvtojson');
const _ = require('lodash');
const dest = './public/data/metric';
const marked = require('marked');

///////////////////////////////////////////////////
// Create destination folders
///////////////////////////////////////////////////
directoriesToMake = ['', 'data', 'data/meta', 'data/metric', 'downloads'];
_.each(siteConfig.geographies, function(geography) {
  directoriesToMake.push('data/metric/' + geography.id);
});
directoriesToMake.forEach((name) => {
  try {
    fs.mkdirSync('public/' + name);
  }
  catch (err) {
    if (err.code !== 'EEXIST') {
      console.log(`Error on creating directory ${name}: ${err.message}`);
    }
  }
});

//////////////////////////////////////////////////
// Copy download, geography, style
//////////////////////////////////////////////////

// Either loop through the geography IDs, or just copy geography.geojson.json.
_.each(siteConfig.geographies || ['geography',], function(geography) {
  fs.readFile(`data/${geography.id}.geojson.json`, 'utf8', (err,data) => {
    if (err) return console.log(`Error on ${geography.name}: ${err.message}`);

    // Add labels
    data = JSON.parse(data);
    data.features = data.features.map((g) => {g.properties.label = geography.label(g.properties.id); return g;});
    data = JSON.stringify(data);
    fs.writeFile(`public/data/${geography.id}.geojson.json`, jsonminify(data), (err) => {
      if (err) return console.log(`Error writing minified geojson for ${geography.name}: ${err.message}`);
      console.log(`Saved and minified geojson for ${geography.name}`);
    });
    }
  );
});

// Copy data download file.
fs.copyFile('data/download/qol-data.zip', 'public/downloads/qol-data.zip', (err) => {
  if (err) return console.log(`Error on copying qol-data.zip: ${err.message}`);
  console.log("Copied qol-data.zip to downloads");
});

// return true if convertable to number
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

////////////////////////////////////////////////
// Process Markdown Meta files into HTML
////////////////////////////////////////////////
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

const src = './data/meta';

fs.readdir(src, (err, files) => {
  if (err) return console.log(`Error on reading /data/meta: ${err.message}`);
  files.forEach((filePath) => {
    if (path.basename(filePath).split('.')[1] == 'md') {
      fs.readFile(path.join(src, filePath), 'utf-8', (err, data) => {
        if (err) return console.log(`Error on reading ${path.join(src,filePath)} ${err.message}`);
        let outFile =
            path.join('public/data/meta', path.basename(filePath).split('.')[0]) +
            '.html';

        marked(data, function(err, content) {
          if (err) {
            return console.log(`Error on running marked: ${err.message}`);
          }
          fs.writeFile(outFile, content, (err) => {
            if (err) return console.log(`Error on writing ${outFile}: ${err.message}`);
            console.log("Wrote " + outFile);
            }
          );
        });
      });
    }
  });
});

///////////////////////////////////////////////
// CSVtoJSON
///////////////////////////////////////////////

// transform csv2json array to id: {y_2012: value} object format
function jsonTransform(jsonArray) {
  let jsonOut = {};
  for (let i = 0; i < jsonArray.length; i++) {
    jsonOut[jsonArray[i]['id']] = {};
    for (let key in jsonArray[i]) {
      if (key !== 'id') {
        if (isNumeric(jsonArray[i][key])) {
          jsonOut[jsonArray[i]['id']][key] = Number(jsonArray[i][key]);
        } else {
          jsonOut[jsonArray[i]['id']][key] = null;
        }
      }
    }
  }
  return jsonOut;
}

function writeMetricFile(destPath, metric, json) {
  const outFile =  path.join(destPath, `m${metric.metric}.json`);
  return fs.writeFile(
      outFile,
      jsonminify(JSON.stringify(json, null, '  ')),
      (err) => {
        if (err) return console.log(`Error on writing ${outFile}: ${err.message}`);
        console.log(`Wrote ${outFile}`);
      }
  );
}

function convertMetricCsvToJson(geography, metric) {
  const basePath = path.join('data/metric', geography);
  const destPath = path.join(dest, geography);
  if (metric.type === 'sum' || metric.type === 'mean') {
    const prefix = (metric.type === 'sum' ? 'r' : 'n');
    csv()
    .fromFile(path.join(basePath, `${prefix}${metric.metric}.csv`))
    .on('end_parsed', jsonObj => {
      let outJSON = {};
      outJSON['map'] = jsonTransform(jsonObj);

      if (metric.accuracy) {
        csv()
        .fromFile(path.join(basePath, `${prefix}${metric.metric}-accuracy.csv`))
        .on('end_parsed', jsonObj => {
          outJSON['a'] = jsonTransform(jsonObj);
          writeMetricFile(destPath, metric, outJSON);
        })
        .on('error', error => {
          console.log(`Error parsing ${prefix}${metric.metric}-accuracy.csv for ${geography}: ${error.message}`);
        });
      } else {
        writeMetricFile(destPath, metric, outJSON);
      }
    })
    .on('error', error => {
      if (error) console.log(`Error parsing ${prefix}${metric.metric}.csv for ${geography}: ${error.message}`);
    });
  }

  if (metric.type === 'weighted') {
    csv()
    .fromFile(path.join(basePath,`r${metric.metric}.csv`))
    .on('end_parsed', jsonObj => {
      let outJSON = {};
      let jsonArrayR = jsonTransform(jsonObj);

      csv()
      .fromFile(path.join(basePath,`d${metric.metric}.csv`))
      .on('end_parsed', jsonObj => {
        let jsonArrayD = jsonTransform(jsonObj);
        try {
          let key, key2;
          for (key in jsonArrayR) {
            for (key2 in jsonArrayR[key]) {
              if (
                  isNumeric(jsonArrayR[key][key2]) &&
                  isNumeric(jsonArrayD[key][key2])
              ) {
                jsonArrayR[key][key2] = jsonArrayR[key][key2] / jsonArrayD[key][key2];
                if (metric.suffix === '%') {
                  jsonArrayR[key][key2] *= 100;
                }
              } else {
                jsonArrayR[key][key2] = null;
              }
            }
          }
        }
        catch (err) {
          return console.log(`Error on ${metric.metric} for ${geography}: ${err.message}`);
        }
        outJSON['w'] = jsonArrayD;
        outJSON['map'] = jsonArrayR;
        if (metric.accuracy) {
          csv()
          .fromFile(path.join(basePath,`m${metric.metric}-accuracy.csv`))
          .on('end_parsed', jsonObj => {
            outJSON['a'] = jsonTransform(jsonObj);
            writeMetricFile(destPath, metric, outJSON);
          })
          .on('error', error => {
            if (error) console.log(`Error parsing m${metric.metric}-accuracy.csv for ${geography}: ${error.message}`);
          });
        } else {
          writeMetricFile(destPath, metric, outJSON);
        }
      })
      .on('error', error => {
        if (error) console.log(`Error parsing d${metric.metric}.csv for ${geography}: ${error.message}`);
      });
    })
    .on('error', error => {
      if (error) console.log(`Error parsing r${metric.metric}.csv for ${geography}: ${error.message}`);
    });
  }
}

// Loop through geographies & variables.
let siteGeographyIds = siteConfig.geographies.map((g) => (g.id));
_.each(dataConfig, function(metric) {
  if (metric.geographies) {
    _.each(metric.geographies.filter((g) => (siteGeographyIds.indexOf(g) !== -1)), function(geography) {
      try {
        convertMetricCsvToJson(geography, metric);
      } catch (err) {
        return console.log(`Error running metricCsvToJson for ${geography}: ${err.message}`);
      }
    });
  }
  else if (metric) {
    convertMetricCsvToJson('', metric);
  }
});
