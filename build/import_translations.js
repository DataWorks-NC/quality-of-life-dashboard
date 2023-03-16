// Convert translation files in javascript and english from a CSV file into js files.

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { parse } from 'csv-parse';
import { forOwn, set, forEach, has, merge } from 'lodash-es';
import { stringify } from 'csv-stringify';

// TODO: Handle data translation file path also.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const translationFilePath = path.join(__dirname, '../src/locales/');

const input = parse(fs.readFileSync(`${translationFilePath}translations.csv`).toString(), {
  "trim": true, "bom": true, "columns": true, "cast": true,
});

const output = {};
const languages = [];

// Read first object to get language keys
forOwn(input[0], (value, key) => {
  if (key.trim() !== 'key') {
    languages.push(key.trim());
    output[key.trim()] = {};
  }
});

forEach(input,
  (v) => { forEach(languages, (lang) => { set(output[lang], v.key, has(v, lang) ? v[lang] : ''); }); });

forEach(languages, (lang) => {
  const existingLangFile = JSON.parse(fs.readFileSync(`${translationFilePath}${lang}.json`));
  fs.writeFileSync(`${translationFilePath}${lang}.json`, stringify(merge(existingLangFile, output[lang]), null, 1));
});
