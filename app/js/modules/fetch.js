import 'babel-polyfill';

const jsonCache = {};
const htmlCache = {};

const fetchResponseJSON = async (path) => {
  if (jsonCache[path]) {
    return jsonCache[path];
  }
  try {
    let response = await fetch(path);
    return jsonCache[path] = await response.json();
  }
  catch (e) {
    return null;
  }
};

const fetchResponseHTML = async (path) => {
  if (htmlCache[path]) {
    return htmlCache[path];
  }
  try {
    let response = await fetch(path);
    return htmlCache[path] = await response.text();
  }
  catch (e) {
    return null;
  }
};

export { fetchResponseJSON, fetchResponseHTML };
