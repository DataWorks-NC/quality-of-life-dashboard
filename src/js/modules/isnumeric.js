// return true if convertable to number
export default function isNumeric(n) {
  const number = parseFloat(n);
  return !Number.isNaN(number) && Number.isFinite(number);
}
