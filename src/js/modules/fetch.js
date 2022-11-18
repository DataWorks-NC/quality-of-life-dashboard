import 'whatwg-fetch';

const jsonCache = {};
const htmlCache = {};
let readFileSync = null;
if (import.meta.env.SSR) {
  import('fs').then(({ readFileSync: readFileSyncFunc}) => { readFileSync = readFileSyncFunc; });
}

async function fetchResponseJSON(path) {
  if (path in jsonCache) {
    return Promise.resolve(jsonCache[path]);
  }
  try {
    if (import.meta.env.SSR) {
      // When rendering the page as a static site, load these using import.
      // eslint disable-next-line
      const json = JSON.parse(readFileSync('dist' + path));
      jsonCache[path] = json;
      return Promise.resolve(json);
    } else {
      return fetch(path).then(response => response.json()).then((json) => {
        jsonCache[path] = json;
        return json;
      });
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

function fetchResponseHTML(path) {
  if (path in htmlCache) {
    return Promise.resolve(htmlCache[path]);
  }
  try {
    if (import.meta.env.SSR) {
      const html = readFileSync('dist' + path);
      htmlCache[path] = html;
      return Promise.resolve(html);
    } else {
      return fetch(path).then(response => response.text()).then((text) => {
        htmlCache[path] = text;
        return text;
      });
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

export { fetchResponseJSON, fetchResponseHTML };
