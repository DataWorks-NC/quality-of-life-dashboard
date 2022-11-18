import isNumeric from './isnumeric.js';

function sum(arr) {
  if (arr.length === 0) return '--';
  return arr.reduce((total, x) => total + x, 0);
}

function mean(arr) {
  return sum(arr) / arr.length;
}

function weighted(arr, weight) {
  const sumR = sum(arr);
  const sumW = sum(weight);
  return sumR / sumW;
}

function median(arr) {
  arr.sort((a, b) => a - b);
  const half = Math.floor(arr.length / 2);

  if (arr.length % 2) {
    return arr[half];
  }

  return (arr[half - 1] + arr[half]) / 2.0;
}

function valsToArray(data = {}, years, keys) {
  const arr = [];
  for (let y = 0; y < years.length; y++) {
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] in data && isNumeric(data[keys[i]][`y_${years[y]}`])) {
        arr.push(data[keys[i]][`y_${years[y]}`]);
      }
    }
  }
  return arr;
}

function wValsToArray(data = {}, weight = {}, years, keys) {
  const arr = [];
  for (let y = 0; y < years.length; y++) {
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] in data && keys[i] in weight && isNumeric(data[keys[i]][`y_${years[y]}`]) && isNumeric(weight[keys[i]][`y_${years[y]}`])) {
        arr.push(data[keys[i]][`y_${years[y]}`] * weight[keys[i]][`y_${years[y]}`]);
      }
    }
  }
  return arr;
}

function calcValue(data, calcType = sum, year, keys) {
  if (calcType === 'sum') {
    const dataArray = valsToArray(data.map, [year], keys);
    return sum(dataArray);
  }
  if (calcType === 'mean') {
    const dataArray = valsToArray(data.map, [year], keys);
    return mean(dataArray);
  }
  if (calcType === 'weighted') {
    const dataArray = wValsToArray(data.map, data.w, [year], keys);
    const wArray = valsToArray(data.w, [year], keys);
    return weighted(dataArray, wArray);
  }
  return false;
}

export {
  sum, mean, weighted, median, valsToArray, wValsToArray, calcValue,
};
