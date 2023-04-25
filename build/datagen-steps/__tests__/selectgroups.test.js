import datagenSelectgroups from "../selectgroups";
import { describe, it, afterEach, expect, vi } from "vitest";
import fs from "fs";

const mockFiles = {
  "test/data/selectgroups.geojson.json": {
    type: "FeatureCollection",
    name: "selectgroups",
    crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    features: [
      {
        type: "Feature",
        properties: {
          id: "Anderson St. / Wrightwood Park",
          label: "Anderson St. / Wrightwood Park",
          label_es: "Anderson St. / Wrightwood Park",
          feature_type: "neighborhood",
        },
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [-78.930283, 35.998401999999402],
                [-78.930298, 35.997951999999408],
                [-78.930832, 35.998341],
                [-78.930283, 35.998401999999402],
              ],
              [
                [-78.939194, 35.989711999999386],
                [-78.939087, 35.989100999999408],
                [-78.938103, 35.989898999999404],
                [-78.939194, 35.989711999999386],
              ],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          id: "C.C. Spaulding",
          label: "C.C. Spaulding (School Assignment Zone)",
          label_es: "C.C. Spaulding (Zona Escolar Asignada)",
          feature_type: "elementary_school_assignment_zone",
        },
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [-78.904602448837778, 35.997216976781779],
                [-78.902767223294489, 35.996199821885007],
                [-78.901883235210533, 35.995714693604413],
                [-78.904602448837778, 35.997216976781779],
              ],
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

describe("selectgroups datagen step", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("processes successfully", async () => {
    const inputFilePath = "test/data/selectgroups.geojson.json";
    const outputFileBasePath = "test/output/selectgroups";

    await datagenSelectgroups({ inputFilePath, outputFileBasePath });

    expect(fs.promises.readFile).toHaveBeenCalledWith(
      "test/data/selectgroups.geojson.json",
      "utf8"
    );

    expect(fs.promises.writeFile.calls).toMatchSnapshot();
  });
});
