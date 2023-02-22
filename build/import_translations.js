// Convert translation files in javascript and english from a CSV file into js files.

// TODO: Split data/interface translations

import fs from 'fs';
import path from 'path';
import * as _ from "lodash";
import parse from 'csv-parse/lib/sync';
import stringify from 'json-stable-stringify';

const translationFilePath = path.join(__dirname, '../src/locales/');

const input = parse(fs.readFileSync(`${translationFilePath}translations.csv`).toString(), {
  "trim": true, "bom": true, "columns": true, "cast": true,
});

const output = {};
const languages = [];

// Read first object to get language keys
_.forOwn(input[0], (value, key) => {
  if (key.trim() !== 'key') {
    languages.push(key.trim());
    output[key.trim()] = {};
  }
});

_.forEach(input,
  (v) => { _.forEach(languages, (lang) => { _.set(output[lang], v.key, _.has(v, lang) ? v[lang] : ''); }); });

_.forEach(languages, (lang) => {
  const existingLangFile = JSON.parse(fs.readFileSync(`${translationFilePath}${lang}.json`));
  fs.writeFileSync(`${translationFilePath}${lang}.json`, stringify(_.merge(existingLangFile, output[lang]), null, 1));
});
