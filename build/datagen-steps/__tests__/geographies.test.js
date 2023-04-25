import datagenGeographies from "../geographies";
import { describe, it, afterEach, expect, vi } from "vitest";
import fs from "fs";

const mockFiles = {
  "test/data/tract.geojson.json": {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "37063000301" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-78.91659552365236, 36.02529313411341],
              [-78.91171787018702, 36.022247561656165],
              [-78.91882712981298, 36.023375551455146],
              [-78.91659552365236, 36.02529313411341],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: { id: "37063000900" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-78.88002906270627, 35.996303796279626],
              [-78.88382279317932, 35.996303796279626],
              [-78.88385467326732, 35.99449901260126],
              [-78.88002906270627, 35.996303796279626],
            ],
          ],
        },
      },
    ],
  },
  "test/data/blockgroup.geojson.json": {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "370630017074" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-78.97806033333333, 36.0593209639964],
              [-78.97589248734873, 36.059622050105006],
              [-78.97630692849285, 36.057702626162616],
              [-78.97806033333333, 36.0593209639964],
            ],
          ],
        },
      },
    ],
  },
  "test/data/other.geojson.json": {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: "123456789" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [60.97806033333333, 30.0593209639964],
              [60.97589248734873, 30.059622050105006],
              [60.97630692849285, 30.057702626162616],
              [60.97806033333333, 30.0593209639964],
            ],
          ],
        },
      },
    ],
  },
};

vi.mock("fs", () => {
  return {
    default: {
      promises: {
        readFile: vi.fn((filepath) => Promise.resolve(JSON.stringify(mockFiles[filepath]))),
        writeFile: vi.fn(),
      },
    },
  };
});

vi.mock("../../../data/config/site.js", () => {
  return {
    default: {
      default: {
        geographies: [
          {
            id: "tract",
            name: "Census Tracts",
            label: (id) => `test_label_tract_${id}`,
            label_es: (id) => `test_label_es_tract_${id}`,
          },
          {
            id: "blockgroup",
            name: "Census Blockgroups",
            label: (id) => `test_label_blockgroup_${id}`,
            label_es: (id) => `test_label_es_blockgroup_${id}`,
          },
          {
            id: "other",
            name: "Other Group",
            label: (id) => `test_label_other_${id}`,
            label_es: (id) => `test_label_es_other_${id}`,
          },
        ],
      },
    },
  };
});

describe("geographies datagen step", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("processes successfully", async () => {
    const inputFileBasePath = "test/data";
    const outputFileBasePath = "test/output/data";

    await datagenGeographies({ inputFileBasePath, outputFileBasePath });

    expect(fs.promises.readFile).toHaveBeenCalledWith("test/data/tract.geojson.json", "utf8");
    expect(fs.promises.readFile).toHaveBeenCalledWith("test/data/blockgroup.geojson.json", "utf8");
    expect(fs.promises.readFile).toHaveBeenCalledWith("test/data/other.geojson.json", "utf8");

    expect(fs.promises.writeFile.calls).toMatchSnapshot();
  });
});
