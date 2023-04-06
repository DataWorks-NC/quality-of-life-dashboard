import datagenMetrics, { exportedForTesting } from "../metrics";
import { describe, it, afterEach, expect, vi } from "vitest";
import fs from "fs";

const { isNumeric, v1CsvToJson, v2CsvToJson } = exportedForTesting;

const mockCsvArrays = {
  "data/metric/blockgroup/CC45_denominator.csv": [
    { year: "2020", fips: "370630020211", value: "2" },
    { year: "2020", fips: "370630023001", value: "0" },
    { year: "2021", fips: "370630020211", value: "2" },
    { year: "2021", fips: "370630023001", value: "0" },
    { year: "2022", fips: "370630020211", value: "2" },
    { year: "2022", fips: "370630023001", value: "0" },
  ],
  "data/metric/blockgroup/CC45_numerator.csv": [
    { year: "2020", fips: "370630020211", value: "0" },
    { year: "2020", fips: "370630023001", value: "0" },
    { year: "2021", fips: "370630020211", value: "0" },
    { year: "2021", fips: "370630023001", value: "0" },
    { year: "2022", fips: "370630020211", value: "0" },
    { year: "2022", fips: "370630023001", value: "0" },
  ],
  "data/metric/tract/nMEDAGE.csv": [
    { id: "37063000101", y_2016: "34.6", y_2017: "35", y_2018: "33", y_2019: "37" },
    { id: "37063000102", y_2016: "33.4", y_2017: "33", y_2018: "35.8", y_2019: "35.4" },
    { id: "37063000200", y_2016: "32.9", y_2017: "33.9", y_2018: "34.5", y_2019: "35" },
  ],
  "data/metric/tract/mMEDAGE-accuracy.csv": [
    { id: "37063000101", y_2016: "3.8", y_2017: "4.9", y_2018: "4.1", y_2019: "5.4" },
    { id: "37063000102", y_2016: "3.2", y_2017: "3.3", y_2018: "2.8", y_2019: "3.7" },
    { id: "37063000200", y_2016: "2.8", y_2017: "2.1", y_2018: "2", y_2019: "1.6" },
  ],
};

vi.mock("fs", () => {
  return {
    default: {
      constants: {
        R_OK: "OK_MOCK",
      },
      promises: {
        access: vi.fn(async (filepath) => {
          if (Object.keys(mockCsvArrays).includes(filepath)) {
            return;
          }
          throw new Error();
        }),
        writeFile: vi.fn(),
      },
    },
  };
});

const csvFromFileSpy = vi.fn((filepath) => Promise.resolve(mockCsvArrays[filepath]));
vi.mock("csvtojson", () => {
  return {
    default: () => {
      return {
        fromFile: csvFromFileSpy,
      };
    },
  };
});

vi.mock("../../../data/config/site.js", () => {
  return {
    default: {
      default: {
        geographies: [{ id: "tract" }, { id: "blockgroup" }],
      },
    },
  };
});

vi.mock("../../../data/config/data.js", () => {
  return {
    default: {
      default: {
        mCC45: {
          metric: "CC45",
          category: "Education",
          suffix: "%",
          title: "Child Care Centers with 4 or 5 Star Ratings",
          title_es: "Centros de Cuidado de Niños Calificados con 4 o 5 estrellas",
          decimals: 1,
          raw_label: "centers",
          type: "weighted",
          geographies: ["blockgroup"],
          world_val: {
            y_2013: 61.47,
            y_2014: 62.43,
            y_2015: 64.35,
            y_2016: 64.35,
            y_2017: 64.31,
            y_2018: 69.1,
            y_2019: 68.79,
            y_2020: 69.0,
            y_2021: 68.03,
            y_2022: 68.54,
          },
        },
        mMEDAGE: {
          metric: "MEDAGE",
          accuracy: "true",
          category: "Demographics",
          subcategory: "Age",
          label: "years",
          title: "Median Age",
          title_es: "Mediana de Edad",
          decimals: 1,
          world_val: {
            y_2010: 33.2,
            y_2011: 33.3,
            y_2012: 33.4,
            y_2013: 33.7,
            y_2014: 34.1,
            y_2015: 34.4,
            y_2016: 34.6,
            y_2017: 35,
            y_2018: 35.2,
            y_2019: 35.4,
          },
          type: "mean",
          geographies: ["tract"],
        },
      },
    },
  };
});

describe("metrics datagen step", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("isNumeric returns true if value is convertible to number, false otherwise", () => {
    expect(isNumeric("a")).toBe(false);
    expect(isNumeric(1)).toBe(true);
    expect(isNumeric("1.0")).toBe(true);
    expect(isNumeric("0.0")).toBe(true);
    expect(isNumeric("false")).toBe(false);
  });

  it("v1CsvToJson properly transforms arrays", () => {
    const testCSVArray = [
      {
        id: "370630001011",
        y_2013: 3,
        y_2014: 2,
        y_2015: 1,
      },
      {
        id: "370630001012",
        y_2013: 3,
        y_2014: 2,
        y_2015: "-",
      },
      {
        id: "370630001022",
        y_2013: 3,
        y_2014: "NaN",
        y_2015: 1,
      },
    ];

    const outputJson = v1CsvToJson(testCSVArray);

    expect(Object.keys(outputJson["370630001011"]).length).toBe(3);
    expect(Object.keys(outputJson["370630001012"]).length).toBe(3);
    expect(Object.keys(outputJson["370630001022"]).length).toBe(3);

    expect(outputJson).toStrictEqual({
      370630001011: {
        y_2013: 3,
        y_2014: 2,
        y_2015: 1,
      },
      370630001012: {
        y_2013: 3,
        y_2014: 2,
        y_2015: null,
      },
      370630001022: {
        y_2013: 3,
        y_2014: null,
        y_2015: 1,
      },
    });
  });

  it("v2CsvtoJson throws errors with bad data", () => {
    const testCSVArray1 = [{ id: "test", foo: "bar" }];
    expect(() => v2CsvToJson(testCSVArray1)).toThrowError();
    const testCSVArray2 = [{ fips: "asdf", year: "", value: 1 }];
    expect(() => v2CsvToJson(testCSVArray2)).toThrowError();
  });

  it("v2CsvtoJson properly transforms arrays", () => {
    const testCSVArray = [
      {
        fips: "370630001011",
        year: 2013,
        value: 3,
      },
      {
        fips: "370630001011",
        year: 2014,
        value: 2,
      },
      {
        fips: "370630001011",
        year: 2015,
        value: 1,
      },
      {
        fips: "370630001012",
        year: 2013,
        value: 3,
      },
      {
        fips: "370630001012",
        year: 2014,
        value: 2,
      },
      {
        fips: "370630001012",
        year: 2015,
        value: "-",
      },
      {
        fips: "370630001022",
        year: 2013,
        value: 3,
      },
      {
        fips: "370630001022",
        year: 2014,
        value: "NaN",
      },
      {
        fips: "370630001022",
        year: 2015,
        value: 1,
      },
    ];

    const outputJson = v2CsvToJson(testCSVArray);

    expect(Object.keys(outputJson["370630001011"]).length).toBe(3);
    expect(Object.keys(outputJson["370630001012"]).length).toBe(3);
    expect(Object.keys(outputJson["370630001022"]).length).toBe(3);

    expect(outputJson).toStrictEqual({
      370630001011: {
        y_2013: 3,
        y_2014: 2,
        y_2015: 1,
      },
      370630001012: {
        y_2013: 3,
        y_2014: 2,
        y_2015: null,
      },
      370630001022: {
        y_2013: 3,
        y_2014: null,
        y_2015: 1,
      },
    });
  });

  it("processes successfully", async () => {
    const inputBase = "data/metric";
    const outputBase = "public/data/metric";

    await datagenMetrics({ inputBase, outputBase });

    expect(csvFromFileSpy).toHaveBeenCalledWith("data/metric/blockgroup/CC45_denominator.csv");
    expect(csvFromFileSpy).toHaveBeenCalledWith("data/metric/blockgroup/CC45_numerator.csv");
    expect(csvFromFileSpy).toHaveBeenCalledWith("data/metric/tract/nMEDAGE.csv");
    expect(csvFromFileSpy).toHaveBeenCalledWith("data/metric/tract/mMEDAGE-accuracy.csv");

    expect(fs.promises.writeFile.calls).toMatchSnapshot();
  });
});
