import { isFinite, sum, mean } from "lodash-es";

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

function valsToArray(data, years, geoIds) {
  const arr = [];
  for (const year of years) {
    for (const geoId of geoIds) {
      if (geoId in data && isFinite(data[geoId][`y_${year}`])) {
        arr.push(data[geoId][`y_${year}`]);
      }
    }
  }
  return arr;
}

function valsToArrayTransposed(data, metricName, years, geographyIds, valueKey) {
  const arr = [];
  for (const year of years) {
    for (const geoId of geographyIds) {
      if (geoId in data && isFinite(data[geoId][metricName]?.[valueKey][`y_${year}`])) {
        arr.push(data[geoId][metricName][valueKey][`y_${year}`]);
      }
    }
  }
  return arr;
}

function wValsToArray(data, weight, years, geoIds) {
  const arr = [];
  for (const year of years) {
    for (const geoId of geoIds) {
      if (
        geoId in data &&
        geoId in weight &&
        isFinite(data[geoId][`y_${year}`]) &&
        isFinite(weight[geoId][`y_${year}`])
      ) {
        arr.push(data[geoId][`y_${year}`] * weight[geoId][`y_${year}`]);
      }
    }
  }
  return arr;
}

function wValsToArrayTransposed(data, metricName, years, geoIds) {
  const arr = [];
  for (const year of years) {
    for (const geoId of geoIds) {
      const value = data[geoId][metricName]?.["map"][`y_${year}`];
      const weight = data[geoId][metricName]?.["w"][`y_${year}`];
      if (geoId in data && value && weight && isFinite(value) && isFinite(weight)) {
        arr.push(value * weight);
      }
    }
  }
  return arr;
}

function calcValue(data, calcType, year, keys) {
  if (calcType === "sum") {
    const dataArray = valsToArray(data.map, [year], keys);
    return sum(dataArray);
  }
  if (calcType === "mean") {
    const dataArray = valsToArray(data.map, [year], keys);
    return mean(dataArray);
  }
  if (calcType === "weighted") {
    const dataArray = wValsToArray(data.map, data.w, [year], keys);
    const wArray = valsToArray(data.w, [year], keys);
    return weighted(dataArray, wArray);
  }
  return false;
}

function calcValueTransposed(data, metric, year, keys) {
  if (metric.type === "sum") {
    const dataArray = valsToArrayTransposed(data, metric.metric, [year], keys, "map");
    return sum(dataArray);
  }
  if (metric.type === "mean") {
    const dataArray = valsToArrayTransposed(data, metric.metric, [year], keys, "map");
    return mean(dataArray);
  }
  if (metric.type === "weighted") {
    const dataArray = wValsToArrayTransposed(data, metric.metric, [year], keys);
    const wArray = valsToArrayTransposed(data, metric.metric, [year], keys, "w");
    return weighted(dataArray, wArray);
  }
  return false;
}

export { sum, mean, weighted, median, valsToArray, wValsToArray, calcValue, calcValueTransposed };
