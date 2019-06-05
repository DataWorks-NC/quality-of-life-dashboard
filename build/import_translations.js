// Convert translation files in javascript and english from a CSV file into js files.

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const parse = require('csv-parse/lib/sync');

const translationFilePath = path.join(__dirname, '../app/lang/');

const input = parse(fs.readFileSync(translationFilePath + 'translations.csv').toString(), { "columns": true, "cast": true });

let output = {};
let languages = [];

// Read first object to get language keys
_.forOwn(input[0], (value, key) => {
  if (key !== 'key') {
    languages.push(key);
    output[key] = {};
  }
});

_.forEach(input,
  (v) => { _.forEach(languages, (lang) => { _.set(output[lang], v.key, _.has(v, lang) ? v[lang] : ''); }); },
);

_.forEach(languages, (lang) => {
  const existingLangFile = JSON.parse(fs.readFileSync(translationFilePath + lang + '.json'));
  fs.writeFileSync(`${translationFilePath}${lang}.json`, JSON.stringify(_.merge(existingLangFile, output[lang]), null, 1))
});
