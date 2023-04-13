import siteConfigData from "../data/config/site.js";
const siteConfig = siteConfigData.default;

import { createDirectories } from "./datagen-helpers.js";

import datagenGeographies from "./datagen-steps/geographies.js";
import datagenSelectgroups from "./datagen-steps/selectgroups.js";
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
    inputFileBasePath: "data",
    outputFileBasePath: "public/data",
  });

  await datagenSelectgroups({
    inputFilePath: "data/selectgroups.geojson.json",
    outputFileBasePath: "public/selectgroups",
  });

  await datagenMeta({
    inputFileBasePaths: ["data/meta/en", "data/meta/es"],
    outputFileBasePath: "public",
  });

  await datagenMetrics({
    inputFileBasePath: "data/metric",
    outputFileBasePath: "public/data/metric",
  });
}

main();
