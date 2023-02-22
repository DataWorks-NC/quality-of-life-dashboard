// Convert translation files in javascript and english to a CSV file.
// Each row contains a key, and then the translations for each language.

import fs from 'fs';
import path from 'path';
import * as _ from 'lodash';
import { stringify } from 'csv-stringify';

// TODO: Handle data translation file path also.
const translationFilePath = path.join(__dirname, '../src/locales/');
const languages = ['en', 'es'];

const output = {};

function iterateKeys(key, val, prefix) {
  let newPrefix = key;
  if (prefix) {
    newPrefix = _.isNumber(key) ? `${prefix}[${key}]` : `${prefix}.${key}`;
  }
  if (_.isString(val)) {
    return { key: newPrefix, translation: val };
  }

  return _.flatMap(val, (value, index) => iterateKeys(index, value, newPrefix));
}

languages.forEach((language) => {
  const input = JSON.parse(fs.readFileSync(`${translationFilePath + language}.json`));

  _.forEach(iterateKeys(null, input, null), (v) => {
    if (!_.has(output, v.key)) {
      output[v.key] = {};
    }
    output[v.key][language] = v.translation;
  });
});

console.log(output);

stringify(
  _.map(output, (v, key) => _.merge({ "key": key }, v)),
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
