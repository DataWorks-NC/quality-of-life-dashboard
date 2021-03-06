// return true if convertable to number
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = isNumeric;
