import siteConfigData from "../data/config/site.js";
const siteConfig = siteConfigData.default;

import { createDirectories } from "./datagen-helpers.js";

import datagenGeographies from "./datagen-steps/geographies.js";
import datagenSelectgropus from "./datagen-steps/selectgroups.js";
import datagenMeta from "./datagen-steps/meta.js";
import datagenMetrics from "./datagen-steps/metrics.js";

const directoriesToMake = [
  "public/",
  "public/selectgroups",
  "public/data",
  "public/data/meta",
  "public/data/meta/en",
  "public/data/meta/es",
  "public/data/metric",
  ...siteConfig.geographies.map((g) => `public/data/metric/${g.id}`),
];

async function main() {
  await createDirectories(directoriesToMake);

  await datagenGeographies({
    inputBase: "data",
    outputBase: "public/data",
  });

  await datagenSelectgropus({
    inputFile: "data/selectgroups.geojson.json",
    outputBase: "public/selectgroups",
  });

  await datagenMeta({
    inputBases: ["data/meta/en", "data/meta/es"],
    outputBase: "public",
  });

  await datagenMetrics({
    inputBase: "data/metric",
    outputBase: "public/data/metric",
  });
}

main();
