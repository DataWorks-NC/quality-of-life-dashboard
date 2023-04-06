import fs from "fs";
import stringify from "json-stable-stringify";
import jsonminify from "jsonminify";
import path from "path";

function genSelectgroupFileName(id) {
  return `${encodeURIComponent(id.replaceAll(" ", "_"))}.geojson.json`;
}

/**
 * Process selectgroups by:
 *
 * - Spliting each selectgroup into its own file
 * - Minifying the resulting JSON
 *
 * Never throws, all errors are caught.
 *
 * @param {Object} options
 * @param {string} options.inputFile The input json file that contains all selectgroups
 * @param {string} options.outputBase The base path to which processed selectgroups will be written
 */
export default async function datagenSelectgroups({ inputFile, outputBase }) {
  // Read single selectgroups file
  let selectgroups;
  try {
    selectgroups = await fs.promises.readFile(inputFile, "utf8");
    selectgroups = JSON.parse(selectgroups);
  } catch (err) {
    console.error(`Error reading selectgroups: ${inputFile}: ${err.message}`);
  }

  // Write to separate selectgroup files
  await Promise.all(
    selectgroups.features.map(async (f) => {
      let selectgroup = {
        type: "FeatureCollection",
        name: "selectgroups",
        crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        features: [f],
      };
      selectgroup = stringify(selectgroup);
      selectgroup = jsonminify(selectgroup);

      const outputPath = path.join(outputBase, genSelectgroupFileName(f.properties.id));
      try {
        await fs.promises.writeFile(outputPath, selectgroup);
      } catch (err) {
        console.error(`Error writing selectgroup ${f.properties.id}: ${err.message}`);
      }
    })
  );

  console.log("Wrote all selectgroups to separate geojson files");
}
