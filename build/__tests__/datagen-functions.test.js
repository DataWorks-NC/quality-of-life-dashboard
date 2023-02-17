import { isNumeric, csvToJsonTransform, newFormatCsvToJsonTransform } from '../datagen-functions';
import { describe, it, expect } from 'vitest';

describe('datagen-functions', () => {
  it('isNumeric returns true if value is convertible to number, false otherwise', () => {
    expect(isNumeric('a')).toBe(false);
    expect(isNumeric(1)).toBe(true);
    expect(isNumeric('1.0')).toBe(true);
    expect(isNumeric('0.0')).toBe(true);
    expect(isNumeric('false')).toBe(false);
  });

  it('csvToJsonTransform properly transforms arrays', () => {
    const testCSVArray = [
      {
        id: '370630001011',
        y_2013: 3,
        y_2014: 2,
        y_2015: 1,
      },
      {
        id: '370630001012',
        y_2013: 3,
        y_2014: 2,
        y_2015: '-',
      },
      {
        id: '370630001022',
        y_2013: 3,
        y_2014: 'NaN',
        y_2015: 1,
      },
    ];

    const outputJson = csvToJsonTransform(testCSVArray);

    expect(Object.keys(outputJson['370630001011']).length).toBe(3);
    expect(Object.keys(outputJson['370630001012']).length).toBe(3);
    expect(Object.keys(outputJson['370630001022']).length).toBe(3);

    expect(outputJson).toStrictEqual({
      '370630001011': {
        y_2013: 3,
        y_2014: 2,
        y_2015: 1,
      },
      '370630001012': {
        y_2013: 3,
        y_2014: 2,
        y_2015: null,
      },
      '370630001022': {
        y_2013: 3,
        y_2014: null,
        y_2015: 1,
      },
    });
  });

  it('new format CSV to json throws errors with bad data', () => {
    const testCSVArray1 = [{id: 'test', foo: 'bar'}];
    expect(() => newFormatCsvToJsonTransform(testCSVArray1)).toThrowError();
    const testCSVArray2 = [{fips: 'asdf', year: '', value: 1}];
    expect(() => newFormatCsvToJsonTransform(testCSVArray2)).toThrowError();
  });

  it('new format CSV to json transform works properly', () => {
    const testCSVArray = [
      {
        fips: '370630001011',
        year: 2013,
        value: 3,
      },
      {
        fips: '370630001011',
        year: 2014,
        value: 2,
      },
      {
        fips: '370630001011',
        year: 2015,
        value: 1,
      },
      {
        fips: '370630001012',
        year: 2013,
        value: 3,
      },
      {
        fips: '370630001012',
        year: 2014,
        value: 2,
      },
      {
        fips: '370630001012',
        year: 2015,
        value: '-',
      },
      {
        fips: '370630001022',
        year: 2013,
        value: 3,
      },
      {
        fips: '370630001022',
        year: 2014,
        value: 'NaN',
      },
      {
        fips: '370630001022',
        year: 2015,
        value: 1,
      },
    ];

    const outputJson = newFormatCsvToJsonTransform(testCSVArray);

    expect(Object.keys(outputJson['370630001011']).length).toBe(3);
    expect(Object.keys(outputJson['370630001012']).length).toBe(3);
    expect(Object.keys(outputJson['370630001022']).length).toBe(3);

    expect(outputJson).toStrictEqual({
      '370630001011': {
        y_2013: 3,
        y_2014: 2,
        y_2015: 1,
      },
      '370630001012': {
        y_2013: 3,
        y_2014: 2,
        y_2015: null,
      },
      '370630001022': {
        y_2013: 3,
        y_2014: null,
        y_2015: 1,
      },
    });
  });
});
