import 'whatwg-fetch';

const jsonCache = {};
const htmlCache = {};

function fetchResponseJSON(path) {
  if (jsonCache[path]) {
    return Promise.resolve(jsonCache[path]);
  }
  try {
    return fetch(path).then(response => response.json()).then((json) => {
      jsonCache[path] = json;
      return json;
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

function fetchResponseHTML(path) {
  if (htmlCache[path]) {
    return Promise.resolve(htmlCache[path]);
  }
  try {
    return fetch(path).then(response => response.text()).then((text) => {
      htmlCache[path] = text;
      return text;
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

export { fetchResponseJSON, fetchResponseHTML };
