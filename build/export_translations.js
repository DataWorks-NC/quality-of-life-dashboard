// Convert translation files in javascript and english to a CSV file.
// Each row contains a key, and then the translations for each language.

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const stringify = require('csv-stringify');

// TODO: Handle data translation file path also.
const translationFilePath = path.join(__dirname, '../src/locales/');
const languages = ['en', 'es'];

let output = {};

function iterateKeys(key, val, prefix) {
  const newPrefix = prefix
      ? (_.isNumber(key) ? `${prefix}[${key}]` : `${prefix}.${key}`)
      : key;
  if (_.isString(val)) {
    return { key: newPrefix, translation: val };
  }
  else {
    return _.flatMap(val, function(value, index) {
      return iterateKeys(index, value, newPrefix);
    });
  }
}

for (const language of languages) {
  const input = JSON.parse(fs.readFileSync(translationFilePath + language + '.json'));

  _.forEach(iterateKeys(null, input, null), function(v) {
    if (!_.has(output, v.key)) {
      output[v.key] = {};
    }
    output[v.key][language] = v.translation;
  });
}

console.log(output);

stringify(
    _.map(output, (v, key) => _.merge({ "key": key }, v)),
    { header: true, columns: ["key"].concat(languages) , quoted: true },
    (err, output) => {
      if (err) {
        return console.log(err);
      }
      console.log(output);
      fs.writeFile(translationFilePath + 'translations.csv', '\ufeff' + output, (err) => {
        if (err) { console.log(err); }
      });
    });
