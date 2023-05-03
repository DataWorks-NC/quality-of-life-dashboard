import fs from "fs";
import stringify from "json-stable-stringify";
import jsonminify from "jsonminify";
import path from "path";
import csv from "csvtojson";
import { ceil, floor } from "lodash-es";

import siteConfigData from "../../data/config/site.js";
import dataConfigData from "../../data/config/data.js";

const dataConfig = dataConfigData.default;
const siteConfig = siteConfigData.default;

/** Return true if `n` is convertible to a number. */
function isNumeric(n) {
  return !Number.isNaN(Number.parseFloat(n)) && Number.isFinite(Number(n));
}

function truncateDecimals(numberMaybeStr, precision) {
  const number = Number(numberMaybeStr);
  if (number < 0) return ceil(number, precision);
  return floor(number, precision);
}

/**
 * Transform CSV array in v1 format to JSON object.
 *
 * Format of v1 CSV:
 *
 * - Each row represents all years of data for a particular FIPS region
 * - The first column (`id`) is always present and represents the FIPS code
 * - Subsequent columns are created for each year of data (y_2013, y_2014, etc.)
 *
 * For example:
 *
 * ```csv
 * id, y_2013, y_2014, y_2015;
 * 370630001011, 17, 17, 18;
 * 370630001012, 13, 14, 13;
 * ```
 *
 * The output JSON object is the same as for the v2 importer. It is keyed by the FIPS code, and
 * contains values in the {y_2012: value, ...} format. For example:
 *
 * ```json
 *  {
 *    "370630001011": {
 *      "y_2013": 17,
 *      "y_2014": 17,
 *      "y_2015": 18
 *  },
 *    "370630001012": {
 *      ...
 *    }
 *  }
 * ```
 */
function v1CsvToJson(csvArray) {
  const jsonOut = {};
  csvArray.forEach((row) => {
    jsonOut[row.id] = {};
    Object.keys(row).forEach((key) => {
      if (key !== "id") {
        jsonOut[row.id][key] = isNumeric(row[key]) ? truncateDecimals(row[key], 5) : null;
      }
    });
  });
  return jsonOut;
}

/**
 * Transform CSV array in v2 format to JSON object.
 *
 * Format of v2 CSV:
 *
 * - Each row represents one year of data for a particular FIPS region
 * - The columns are always `year, fips, value`
 *
 * For example:
 *
 * ```csv
 * year, fips, value;
 * 2013, 370630001011, 17;
 * 2014, 370630001011, 17;
 * 2015, 370630001011, 18;
 * 2013, 370630001012, 13;
 * 2014, 370630001012, 14;
 * 2015, 370630001012, 13;
 * ```
 *
 * The output JSON object is the same as for the v1 importer. It is keyed by the FIPS code, and
 * contains values in the {y_2012: value, ...} format. For example:
 *
 * ```json
 *  {
 *    "370630001011": {
 *      "y_2013": 17,
 *      "y_2014": 17,
 *      "y_2015": 18
 *  },
 *    "370630001012": {
 *      ...
 *    }
 *  }
 * ```
 */
function v2CsvToJson(csvArray) {
  const jsonOut = {};
  csvArray.forEach((row) => {
    if (!("fips" in row && "year" in row && "value" in row)) {
      throw new TypeError("Each row must have keys fips, year and value");
    }
    if (!row.fips || !row.year) {
      throw new TypeError("Each row must have a valid fips and year value");
    }
    if (!(row.fips in jsonOut)) {
      jsonOut[row.fips] = {};
    }
    jsonOut[row.fips][`y_${row.year}`] = isNumeric(row.value)
      ? truncateDecimals(row.value, 5)
      : null;
  });
  return jsonOut;
}

/**
 * @param {any} destPath
 * @param {any} metric
 * @param {any} json
 */
async function writeMetricFile(destPath, metric, json) {
  const outFile = path.join(destPath, `m${metric.metric}.json`);
  try {
    await fs.promises.writeFile(outFile, jsonminify(stringify(json, null, "  ")));
    console.log(`Wrote ${outFile}`);
  } catch (err) {
    console.error(`Error on writing ${outFile}: ${err.message}`);
  }
}

/**
 * Asynchronously checks if given filenames represent files that are readable by the current user.
 *
 * Returns a `readabilityStatus` object of the form:
 *
 *     {
 *      [fileName: string]: "readable" | "notReadable"
 *     }
 *
 * Does not throw.
 *
 * @param {string[]} fileNames
 * @returns {Promise<({ [fileName: string]: "readable" | "notReadable" })[]}
 */
async function checkIfFilesAreReadable(fileNames) {
  const readabilityStatusArray = await Promise.all(
    fileNames.map(async (f) => {
      try {
        await fs.promises.access(f, fs.constants.R_OK);
        return { [f]: "readable" };
      } catch {
        return { [f]: "notReadable" };
      }
    })
  );
  // Merge array of status objects into one object
  return Object.assign({}, ...readabilityStatusArray);
}

/**
 * Find existing metric input CSV files in the filesystem by searching for either v1 or v2 naming
 * conventions of file names. Return the name of the first matching file found.
 *
 * @param {string} geography
 * @param {string} metric
 * @param {"r" | "d" | "n" | "accuracy"} type
 */
async function checkMetricFileName(geography, metric, type, inputFileBasePath) {
  const basePath = path.join(inputFileBasePath, geography);
  let fileNamePossibilities = [];

  if (type === "accuracy") {
    fileNamePossibilities = [
      {
        name: path.join(basePath, `m${metric.metric.toUpperCase()}-accuracy.csv`),
        format: "v1",
      },
      {
        name: path.join(basePath, `m${metric.metric.toLowerCase()}-accuracy.csv`),
        format: "v1",
      },
    ];
  } else {
    let suffix = "";
    if (type === "r") {
      suffix = "numerator";
    } else if (type === "d") {
      suffix = "denominator";
    } else if (type === "n") {
      suffix = "value";
    }
    fileNamePossibilities = [
      {
        name: path.join(basePath, `${metric.metric.toUpperCase()}_${suffix}.csv`),
        format: "v2",
      },
      {
        name: path.join(basePath, `${metric.metric.toLowerCase()}_${suffix}.csv`),
        format: "v2",
      },
      {
        name: path.join(basePath, `${type}${metric.metric.toUpperCase()}.csv`),
        format: "v1",
      },
      {
        name: path.join(basePath, `${type}${metric.metric.toLowerCase()}.csv`),
        format: "v1",
      },
    ];
  }

  const fileNames = fileNamePossibilities.map((f) => f.name);
  const filesStatus = await checkIfFilesAreReadable(fileNames);
  fileNamePossibilities = fileNamePossibilities.filter((f) => filesStatus[f.name] === "readable");

  if (fileNamePossibilities.length > 0) {
    return fileNamePossibilities[0];
  }

  return false;
}

/** Convert accuracy metric accuracy files from CSV to JSON and return the JSON. */
async function convertAccuracy(geography, metric, { inputFileBasePath }) {
  const accuracyFile = await checkMetricFileName(geography, metric, "accuracy", inputFileBasePath);
  if (!accuracyFile) {
    console.error(`Could not find matching accuracy file for ${metric.metric} for ${geography}.`);
    return;
  }
  try {
    const accuracyCsvImport = await csv().fromFile(accuracyFile.name);
    return await v1CsvToJson(accuracyCsvImport);
  } catch (error) {
    console.error(
      `Error parsing accuracy file for ${metric.metric} for ${geography}: ${error.message}`
    );
  }
}

/**
 * Convert sum or mean metrics from CSV to JSON and write out resulting file(s).
 *
 * Can throw errors.
 */
async function convertSumOrMeanMetric(
  geography,
  metric,
  { inputFileBasePath, outputFileBasePath }
) {
  const outJSON = {};
  const type = metric.type === "sum" ? "r" : "n";
  const metricFile = await checkMetricFileName(geography, metric, type, inputFileBasePath);

  if (!metricFile) {
    throw Error(`Could not find ${metric.type} metric CSV files`);
  }

  let csvArray;
  // Read CSV
  try {
    csvArray = await csv().fromFile(metricFile.name);
  } catch (err) {
    throw Error(`Error importing ${metric.type} metric CSV file: ${err.message}`);
  }
  // Convert metric
  try {
    if (metricFile.format === "v2") {
      outJSON.map = v2CsvToJson(csvArray);
    } else {
      outJSON.map = v1CsvToJson(csvArray);
    }
  } catch (err) {
    throw Error(`Error converting ${metric.type} metric CSV file to JSON: ${err.message}`);
  }
  // Convert accuracy
  try {
    if (metric.accuracy) {
      outJSON.a = await convertAccuracy(geography, metric, { inputFileBasePath });
    }
  } catch (err) {
    throw Error(
      `Error converting ${metric.type} metric accuracy  CSV file to JSON: ${err.message}`
    );
  }
  // Write metric file
  const dest = path.join(outputFileBasePath, geography);
  return writeMetricFile(dest, metric, outJSON);
}

/**
 * Convert weighted metric from CSV to JSON and write out resulting file(s).
 *
 * Can throw errors.
 */
async function convertWeightedMetric(geography, metric, { inputFileBasePath, outputFileBasePath }) {
  const outJSON = {};
  const files = [
    await checkMetricFileName(geography, metric, "r", inputFileBasePath),
    await checkMetricFileName(geography, metric, "d", inputFileBasePath),
  ];

  if (!files[0]) {
    throw Error(`Could not find numerator (R) CSV file for weighted metric.`);
  }

  if (!files[1]) {
    throw Error(`Could not find denominator (D) CSV file for weighted metric.`);
  }

  let jsonArrayR, jsonArrayD;

  // Read both R (numerator) and D (denominator) files
  [jsonArrayR, jsonArrayD] = await Promise.all(
    files.map(async (file) => {
      let csvArray;
      try {
        csvArray = await csv().fromFile(file.name);
      } catch (err) {
        throw Error(`Error importing weighted metric CSV file ${file.name}`);
      }
      try {
        if (file.format === "v2") {
          return v2CsvToJson(csvArray);
        }
        return v1CsvToJson(csvArray);
      } catch (err) {
        throw Error(`Error converting weighted metric CSV to JSON ${file.name}`);
      }
    })
  );

  try {
    // Divide each value in R by D
    Object.keys(jsonArrayR).forEach((key) => {
      Object.keys(jsonArrayR[key]).forEach((key2) => {
        if (isNumeric(jsonArrayR[key][key2]) && isNumeric(jsonArrayD[key][key2])) {
          let value = jsonArrayR[key][key2] / jsonArrayD[key][key2];
          if (metric.suffix === "%") {
            value *= 100;
          }
          jsonArrayR[key][key2] = truncateDecimals(value, 5);
        } else {
          jsonArrayR[key][key2] = null;
        }
      });
    });
  } catch (err) {
    throw Error(`Error computing weighted metric value`);
  }
  outJSON.w = jsonArrayD;
  outJSON.map = jsonArrayR;
  if (metric.accuracy) {
    outJSON.a = await convertAccuracy(geography, metric, { inputFileBasePath });
  }
  // Write metric file
  const dest = path.join(outputFileBasePath, geography);
  return writeMetricFile(dest, metric, outJSON);
}

/**
 * Convert given metric from CSV to JSON and write out resulting file(s).
 *
 * Can throw errors.
 */
async function convertMetric(geography, metric, { inputFileBasePath, outputFileBasePath }) {
  if (metric.type === "sum" || metric.type === "mean") {
    await convertSumOrMeanMetric(geography, metric, { inputFileBasePath, outputFileBasePath });
  }

  if (metric.type === "weighted") {
    await convertWeightedMetric(geography, metric, { inputFileBasePath, outputFileBasePath });
  }
}

/**
 * Process metrics defined in the data config.
 *
 * Never throws, all errors are caught.
 *
 * @param {Object} options
 * @param {string} options.inputFileBasePath The base path from which input metrics will be read
 * @param {string} options.outputFileBasePath The base path to which processed metrics will be
 *   written
 */
export default async function datagenMetrics({ inputFileBasePath, outputFileBasePath }) {
  const siteGeographyIds = siteConfig.geographies.map((g) => g.id);
  // Process all metrics defined in data config.
  await Promise.all(
    Object.values(dataConfig).map(async (metric) => {
      // If metric has defined geographies, convert only the ones included in the site config.
      if (metric.geographies) {
        console.log(`Converting metric CSVs to JSON for ${metric.metric}`);
        await Promise.all(
          metric.geographies
            .filter((g) => siteGeographyIds.includes(g))
            .map(async (geography) => {
              try {
                await convertMetric(geography, metric, { inputFileBasePath, outputFileBasePath });
              } catch (err) {
                console.error(
                  `Metric conversion error: ${err.message} metric=${metric.metric} geography=${geography}:`
                );
              }
            })
        );
        console.log(`Successfully converted metric CSV to JSON for ${metric.metric}`);
      } else if (metric) {
        // Omit geography if metric does not have any defined
        try {
          await convertMetric("", metric, { inputFileBasePath, outputFileBasePath });
        } catch (err) {
          console.error(
            `Metric conversion error: ${err.message} metric=${metric.metric} geography=none:`
          );
        }
      }
    })
  );
}

export const exportedForTesting = {
  isNumeric,
  v1CsvToJson,
  v2CsvToJson,
  checkMetricFileName,
};
