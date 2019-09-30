import _ from 'lodash';
import colors from './breaks';

const mapConfig = require('../../../data/config/map.js');
const siteConfig = require('../../../data/config/site.js');
const dataConfigUnsorted = require('../../../data/config/data');
const privateConfig = require('../../../data/config/private');
const selectGroups = require('../../../data/config/selectgroups');

// Sort dataConfig alphabetically by metric and category
let dataConfigTemp = [];
// eslint-disable-next-line no-restricted-syntax
for (const key in dataConfigUnsorted) {
  if (key in dataConfigUnsorted) {
    const t = dataConfigUnsorted[key];
    t._key = key;
    dataConfigTemp.push(t);
  }
}

dataConfigTemp = dataConfigTemp.sort((a, b) => {
  if (a.category > b.category) return 1;
  if (a.category < b.category) return -1;
  if (a.title > b.title) return 1;
  if (a.title < b.title) return -1;
  return 0;
});
const dataConfig = dataConfigTemp.reduce((obj, curVal) => { obj[curVal._key] = curVal; return obj; }, {});
const categories = dataConfigTemp.reduce((categoriesArray, curVal) => { if (categoriesArray.indexOf(curVal.category) === -1) categoriesArray.push(curVal.category); return categoriesArray; }, []);

const metricsByCategory = _.fromPairs(
  categories.map(
    category => [category, Object.values(dataConfig).filter(metric => metric.category === category)],
  ),
);

export default {
  categories, // List of category names only
  colors: colors.breaksGnBu5,
  dataConfig, // Object where keys are metric IDs and values are config for that metric.
  mapConfig,
  metricsByCategory, // Object where keys are category names and properties are metrics within that category.
  privateConfig,
  siteConfig,
  selectGroups,
};
