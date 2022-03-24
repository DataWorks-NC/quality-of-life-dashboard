/* eslint-disable no-console */

const path = require('path');
const jsonminify = require('jsonminify');
const fs = require('fs');
const stringify = require('json-stable-stringify');

// return true if convertable to number
function isNumeric(n) {
  // eslint-disable-next-line no-restricted-globals
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Transform data CSV array to JSON object.
 *
 * In CSV array, each item in array represents a row in CSV, keyed by the column names.
 * JSON object has keys of id, each with {y_2012: value, ...} format.
 */
function csvToJsonTransform(csvArray) {
  const jsonOut = {};
  for (let i = 0; i < csvArray.length; i++) {
    jsonOut[csvArray[i].id] = {};
    Object.keys(csvArray[i]).forEach(key => {
      if (key !== 'id') {
        if (isNumeric(csvArray[i][key])) {
          jsonOut[csvArray[i].id][key] = Number(csvArray[i][key]);
        } else {
          jsonOut[csvArray[i].id][key] = null;
        }
      }
    });
  }
  return jsonOut;
}

/**
 * Transform new format CSV array to JSON object.
 *
 * New format CSV has columns id, year, value.
 * Output JSON object has keys of id, each with {y_2012: value, ...} format.
 */
function newFormatCsvToJsonTransform(csvArray) {
  const jsonOut = {};
  csvArray.forEach(row => {
    if (!('fips' in row && 'year' in row && 'value' in row)) {
      throw new TypeError('Each row must have keys fips, year and value');
    }
    if (!row.fips || !row.year) {
      throw new TypeError('Each row must have a valid fips and year value');
    }
    if (!(row.fips in jsonOut)) {
      jsonOut[row.fips] = {};
    }
    jsonOut[row.fips][`y_${row.year}`] = isNumeric(row.value) ? Number(row.value) : null;
  });
  return jsonOut;
}

async function writeMetricFile(destPath, metric, json) {
  const fsPromises = fs.promises;

  const outFile = path.join(destPath, `m${metric.metric}.json`);
  return fsPromises.writeFile(
    outFile, jsonminify(stringify(json, null, '  ')),
  )
    .catch((err) => console.error(`Error on writing ${outFile}: ${err.message}`))
    .then(() => console.log(`Wrote ${outFile}`));
}

/**
 * Check for a valid metric filename in old or new format and return the first
 * matching filename.
 *
 * @param geography
 * @param metric
 * @param type
 */
function checkMetricFileName(geography, metric, type) {
  const basePath = path.join('data/metric', geography);

  let suffix = '';
  if (type === 'r') {
    suffix = 'numerator';
  } else if (type === 'd') {
    suffix = 'denominator';
  } else if (type === 'n') {
    suffix = 'value';
  }

  let fileNamePossibilities = [];
  if (type === 'accuracy') {
    fileNamePossibilities = [
      {
        name: path.join(basePath, `m${metric.metric.toUpperCase()}-accuracy.csv`),
        format: 'old',
      },
      {
        name: path.join(basePath, `m${metric.metric.toLowerCase()}-accuracy.csv`),
        format: 'old',
      },
    ];
  }
  else {
    fileNamePossibilities = [
      {
        name: path.join(basePath, `${metric.metric.toUpperCase()}_${suffix}.csv`),
        format: 'new',
      },
      {
        name: path.join(basePath, `${metric.metric.toLowerCase()}_${suffix}.csv`),
        format: 'new',
      },
      {
        name: path.join(basePath, `${type}${metric.metric.toUpperCase()}.csv`),
        format: 'old',
      },
      {
        name: path.join(basePath, `${type}${metric.metric.toLowerCase()}.csv`),
        format: 'old',
      },
    ];
  }
  fileNamePossibilities = fileNamePossibilities.filter(f => fs.existsSync(f.name));

  if (fileNamePossibilities.length > 0) {
    return fileNamePossibilities[0];
  }

  return false;
}

module.exports = {
  isNumeric,
  csvToJsonTransform,
  newFormatCsvToJsonTransform,
  writeMetricFile,
  checkMetricFileName,
};
