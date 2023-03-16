/* eslint-disable no-console */

// Convert translation files in javascript and english to a CSV file.
// Each row contains a key, and then the translations for each language.

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { isString, isNumber, forEach, flatMap, has, map, merge } from 'lodash-es';
import { stringify } from 'csv-stringify';

// TODO: Handle data translation file path also.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const translationFilePath = path.join(__dirname, '../src/locales/');
const languages = ['en', 'es'];

const output = {};

function iterateKeys(key, val, prefix) {
  let newPrefix = key;
  if (prefix) {
    newPrefix = isNumber(key) ? `${prefix}[${key}]` : `${prefix}.${key}`;
  }
  if (isString(val)) {
    return { key: newPrefix, translation: val };
  }

  return flatMap(val, (value, index) => iterateKeys(index, value, newPrefix));
}

languages.forEach((language) => {
  const input = JSON.parse(fs.readFileSync(`${translationFilePath + language}.json`));

  forEach(iterateKeys(null, input, null), (v) => {
    if (!has(output, v.key)) {
      output[v.key] = {};
    }
    output[v.key][language] = v.translation;
  });
});

console.log(output);

stringify(
  map(output, (v, key) => merge({ "key": key }, v)),
  { header: true, columns: ["key"].concat(languages), quoted: true },
  (err, outData) => {
    if (err) {
      return console.log(err);
    }
    console.log(output);
    fs.writeFile(`${translationFilePath}translations.csv`, `\ufeff${outData}`, (err2) => {
      if (err2) { console.log(err2); }
    });
  },
);
