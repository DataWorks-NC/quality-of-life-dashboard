/* eslint-disable no-console */
import { mapKeys } from "lodash-es";
import fs from "fs";
import jsonminify from "jsonminify";
import md5 from "js-md5";
import path from "path";
import stringify from "json-stable-stringify";

import { calcValueTransposed } from "../src/js/helpers/metricCalculations.js";
import generateDownloadCSVs from "./download-datagen.js";
import { createDirectories } from "./datagen-helpers.js";

import siteConfigData from "../data/config/site.js";
import dataConfigData from "../data/config/data.js";

const dataConfig = dataConfigData.default;
const siteConfig = siteConfigData.default;

const inputFileBasePath = "./public/data/metric";
const outputFileBasePath = "./public/data/report";

/**
 * Loads metric data for all geographies from JSON files written in datagen step, transposes it to
 * be keyed differently, and returns it in one in-memory object. The new keying is as follows:
 *
 * 1. Geography level (e.g. "tract")
 * 2. Geography key (e.g. 37063000101)
 * 3. Metric name (e.g. "AFTERNOON-COOL-ISLANDS")
 *
 * The value contained under the last key is an object structured as follows:
 *
 * ```json
 * {
 *  "map": {y_2012: value, ...},
 *  "w": {y_2012: value, ...}
 * }
 * ```
 */
async function loadAndTransposeAllMetrics(metricGeographyPairs) {
  const metrics = {};

  await Promise.all(
    metricGeographyPairs.map(async ({ geographyId, metricConfig: { metric: metricName } }) => {
      if (!(geographyId in metrics)) {
        metrics[geographyId] = {};
      }

      const metricFilePath = path.join(inputFileBasePath, `${geographyId}/m${metricName}.json`);

      // Read metric file
      let metricFileContents;
      try {
        metricFileContents = await fs.promises.readFile(metricFilePath);
      } catch (err) {
        console.error(`Error reading ${metricFilePath}: ${err.message}`);
        throw err;
      }

      // Parse metric data
      let metricData;
      try {
        metricData = JSON.parse(metricFileContents);
      } catch (err) {
        console.error(`Error parsing ${metricFilePath}: ${err.message}`);
        throw err;
      }

      // Transpose metric for each geography
      Object.entries(metricData.map).forEach(([geographyKey, yearsData]) => {
        if (!(geographyKey in metrics[geographyId])) {
          metrics[geographyId][geographyKey] = {};
        }
        metrics[geographyId][geographyKey][metricName] = {
          map: yearsData,
        };
        if ("w" in metricData) {
          metrics[geographyId][geographyKey][metricName].w = metricData.w[geographyKey];
        }
      });
    })
  );

  return metrics;
}

/**
 * Compute averages for each metric across the entire county (all geographies).
 *
 * - Uses `world_val` from the data config as the county average for a metric when it is set.
 * - Otherwise, county averages are computed from metric data. The order of the `geographies` array in
 *   the site config determines the precedence of which geography level serves as the source for the
 *   aggregation.
 *
 * Returns an object representing averages and sums across the county for each metric. With the
 * format:
 *
 * ```json
 * {
 *   "ACCOMMODATION-WORKERS": {
 *     "2010": 8.40863,
 *     "2011": 7.96962,
 *     "2012": 7.87258,
 *   },
 *   "AFTERNOON-COOL-ISLANDS": { ... },
 *   ...
 * ```
 */
function computeCountyAverages(metrics, metricGeographyPairs) {
  const countyAverages = {};

  metricGeographyPairs.forEach(({ geographyId, metricConfig }) => {
    // Use `world_val` as county average when it is set in config/data.js
    if ("world_val" in metricConfig && !(metricConfig.metric in countyAverages)) {
      countyAverages[metricConfig.metric] = mapKeys(metricConfig.world_val, (_, key) =>
        key.replace("y_", "")
      );
    } else if (!(metricConfig.metric in countyAverages)) {
      countyAverages[metricConfig.metric] = {};
    }

    // Otherwise, compute county averages from metric data, using geography level as precedence.
    if (geographyId === "tract" || geographyId === "blockgroup") {
      const geographyKeys = Object.keys(metrics[geographyId]);

      // Get the maximal set of years for the metric across all the geographies in the current geography level.
      const yearSet = new Set();
      geographyKeys.forEach((geographyKey) => {
        const values = metrics[geographyId][geographyKey][metricConfig.metric]?.map;
        // Geographies may not have data for some metrics
        if (!values) {
          return;
        }
        const yearsForGeography = Object.keys(values);
        yearsForGeography.forEach((year) => {
          yearSet.add(year.replace("y_", ""));
        });
      });
      const years = Array.from(yearSet).sort();

      // Compute county averages for each year
      years.forEach((year) => {
        // Do not recompute county averages if they already exist for a given year
        // (e.g. from world_val or aggregated from a different geography level)
        if (year in countyAverages[metricConfig.metric]) {
          return;
        }
        const countyAverage = calcValueTransposed(
          metrics[geographyId],
          metricConfig,
          year,
          geographyKeys
        );
        countyAverages[metricConfig.metric][year] = countyAverage;
      });
    }
  });

  return countyAverages;
}

async function main() {
  const directoriesToMake = [
    "public/",
    "public/data",
    "public/data/report",
    "public/download",
    ...siteConfig.geographies.map((g) => `public/data/report/${g.id}`),
  ];

  await createDirectories(directoriesToMake);

  // Create an array of each unique (metric, geography) pair to iterate through
  const metricGeographyPairs = siteConfig.geographies.flatMap((g) =>
    Object.values(dataConfig)
      .filter((m) => m.geographies.includes(g.id))
      .map((m) => ({ geographyId: g.id, metricConfig: m }))
  );

  let metrics;
  try {
    metrics = await loadAndTransposeAllMetrics(metricGeographyPairs);
  } catch (err) {
    console.error(`Error on looping through metrics: ${err.message}`);
  }

  let countyAverages;
  try {
    countyAverages = computeCountyAverages(metrics, metricGeographyPairs);
  } catch (err) {
    console.error(`Error computing county averages: ${err.message}`);
  }

  // Write county averages
  const outFile = path.join(outputFileBasePath, "county_averages.json");
  try {
    await fs.promises.writeFile(outFile, jsonminify(stringify(countyAverages)));
    console.log(`Wrote ${outFile}`);
  } catch (err) {
    console.error(`Error on writing ${outFile}: ${err.message}`);
  }

  // Write a file for each distinct geography with just the metrics for that geography
  await Promise.all(
    siteConfig.geographies.map(async ({ id: geographyId }) => {
      await Promise.all(
        Object.entries(metrics[geographyId]).map(async ([geographyKey, metricData]) => {
          let filename = geographyKey;
          if (geographyId === "neighborhood") {
            filename = md5(geographyKey);
          }
          const outFile = path.join(outputFileBasePath, `${geographyId}/${filename}.json`);
          try {
            await fs.promises.writeFile(
              outFile,
              jsonminify(stringify({ geography_name: geographyKey, ...metricData }))
            );
            console.log(`Saved report JSON for ${geographyId} ${filename} (${geographyKey})`);
          } catch (err) {
            console.error(
              `Error saving report JSON for ${geographyId} ${filename} (${geographyKey}): ${err.message}`
            );
          }
        })
      );
    })
  );

  await generateDownloadCSVs(metrics);
}

main();
