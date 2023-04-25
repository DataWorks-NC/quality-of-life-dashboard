import fs from "fs";
import stringify from "json-stable-stringify";
import jsonminify from "jsonminify";
import path from "path";

import siteConfigData from "../../data/config/site.js";

const siteConfig = siteConfigData.default;

function addLabels(data, labelFunc, labelEsFunc) {
  data.features.forEach((f) => {
    f.properties.label = f.properties.label ?? labelFunc(f.properties.id);
    f.properties.label_es = f.properties.label_es ?? labelEsFunc(f.properties.id);
  });
  return data;
}

/**
 * Process geographies defined in the site config by:
 *
 * - Adding "label" and "label_es" fields
 * - Minifying the resulting JSON
 *
 * Never throws, all errors are caught.
 *
 * @param {Object} options
 * @param {string} options.inputFileBasePath The base path from which input geographies will be read
 * @param {string} options.outputFileBasePath The base path to which processed geogrpahies will be
 *   written
 */
export default async function datagenGeographies({ inputFileBasePath, outputFileBasePath }) {
  await Promise.all(
    siteConfig.geographies.map(async (config) => {
      let data;
      try {
        const inputPath = path.join(inputFileBasePath, `${config.id}.geojson.json`);
        data = await fs.promises.readFile(inputPath, "utf8");
        data = JSON.parse(data);
        data = addLabels(data, config.label, config.label_es);
        data = stringify(data);
        data = jsonminify(data);
      } catch (err) {
        console.error(`Error reading or processing geography: ${config.name}: ${err.message}`);
      }

      const outputPath = path.join(outputFileBasePath, `${config.id}.geojson.json`);
      try {
        await fs.promises.writeFile(outputPath, data);
        console.log(`Saved processed geography: ${config.name}`);
      } catch (err) {
        console.error(`Error writing processed geography: ${config.name}: ${err.message}`);
      }
    })
  );
}
