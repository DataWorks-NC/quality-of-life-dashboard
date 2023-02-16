import {isArray} from 'lodash-es';

function deleteFrom(ary, item) {
  if (!isArray(ary)) return [];
  return ary.filter(i => i !== item);
}
// Pull a param from an object and convert it to an array if it isn't already
function paramToArray(object, name) {
  if (!(name in object) || !object[name]) {
    return [];
  }
  if (!isArray(object[name])) {
    return [object[name]];
  }
  return object[name];
}


// ****************************************
// Return the nth instance of a substring
// ****************************************
function getSubstringIndex(str, substring, n) {
  let times = 0;
  let
    index = null;
  while (times < n && index !== -1) {
    index = str.indexOf(substring, index + 1);
    times++;
  }
  return index;
}

export {
  deleteFrom,
  paramToArray,
  getSubstringIndex,
};
