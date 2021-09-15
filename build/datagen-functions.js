/* eslint-disable no-console */

const path = require('path');
const jsonminify = require('jsonminify');
const fs = require('fs');

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
    outFile, jsonminify(JSON.stringify(json, null, '  ')),
  )
    .catch((err) => console.error(`Error on writing ${outFile}: ${err.message}`))
    .then(() => console.log(`Wrote ${outFile}`));
}

module.exports = {
  isNumeric,
  csvToJsonTransform,
  newFormatCsvToJsonTransform,
  writeMetricFile,
};
