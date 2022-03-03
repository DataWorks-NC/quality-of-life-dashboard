// ****************************************
// Return the nth instance of a substring
// ****************************************
export default function getSubstringIndex(str, substring, n) {
  let times = 0; let
    index = null;
  while (times < n && index !== -1) {
    index = str.indexOf(substring, index + 1);
    times++;
  }
  return index;
}
