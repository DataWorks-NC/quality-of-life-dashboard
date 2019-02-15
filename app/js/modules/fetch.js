import 'whatwg-fetch';

const jsonCache = {};
const htmlCache = {};

function fetchResponseJSON(path) {
  if (jsonCache[path]) {
    return jsonCache[path];
  }
  try {
    return fetch(path).then((response) => {
      return response.json();
    }).then((json) => {
      jsonCache[path] = json;
      return json;
    });
  } catch (e) {
    return null;
  }
}

function fetchResponseHTML(path) {
  if (htmlCache[path]) {
    return htmlCache[path];
  }
  try {
    return fetch(path).then((response) => {
      return response.text();
    }).then((text) => {
      htmlCache[path] = text;
      return text;
    });
  } catch (e) {
    return null;
  }
};

export { fetchResponseJSON, fetchResponseHTML };
