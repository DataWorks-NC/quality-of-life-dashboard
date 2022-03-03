// return true if convertable to number
function isNumeric(n) {
  return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
}

module.exports = isNumeric;
