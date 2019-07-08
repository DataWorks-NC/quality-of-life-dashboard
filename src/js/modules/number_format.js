import isNumeric from './isnumeric';

function legendLabelNumber(value, config) {
  let prefix = ''; let
    suffix = '';
  if (config.hasOwnProperty('prefix')) {
    prefix = config.prefix;
  }
  if (config.hasOwnProperty('suffix')) {
    suffix = config.suffix;
  }
  const num = config.commas || prefix === '$' ? abbrNum(value, config.decimals) : round(value, config.decimals);
  return prefix + num + suffix;
}

function abbrNum(number, decPlaces) {
  // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10, decPlaces);
  // Enumerate number abbreviations
  const abbrev = ["k", "m", "b", "t"];
  // Go through the array backwards, so we do the largest first
  for (let i = abbrev.length - 1; i >= 0; i--) {
    // Convert array index to "1000", "1000000", etc
    const size = Math.pow(10, (i + 1) * 3);
    // If the number is bigger or equal do the abbreviation
    if (size <= number) {
      // Here, we multiply by decPlaces, round, and then divide by decPlaces.
      // This gives us nice rounding to a particular decimal place.
      number = Math.round(number * decPlaces / size) / decPlaces;
      // Handle special case where we round up to the next abbreviation
      if ((number == 1000) && (i < abbrev.length - 1)) {
        number = 1;
        i++;
      }
      // Add the letter for the abbreviation
      number += abbrev[i];
      // We are done... stop
      break;
    }
  }
  return number;
}

function round(number, decPlaces = 0) {
  return Number(number.toFixed(decPlaces));
}

function commafy(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberfixes(number, prefix = '', suffix = '') {
  return prefix + number + suffix;
}

function prettyNumber(number, decimals = 0, prefix = '', suffix = '', commas = true) {
  if (isNumeric(number)) {
    if (commas) {
      return numberfixes(commafy(round(Number(number), decimals)), prefix,
        suffix);
    }

    return numberfixes(round(Number(number), decimals), prefix,
      suffix);
  }
  return '--';
}


export {
  legendLabelNumber, abbrNum, round, numberfixes, commafy, prettyNumber,
};
