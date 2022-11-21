import 'whatwg-fetch';

const jsonCache = {};
const htmlCache = {};
let readFileSync = null;
let fileExists = null;
if (import.meta.env.SSR) {
  import('fs').then(({ readFileSync: readFileSyncFunc, existsSync }) => { readFileSync = readFileSyncFunc; fileExists = existsSync; });
}

async function fetchResponseJSON(path) {
  if (path in jsonCache) {
    return Promise.resolve(jsonCache[path]);
  }
  try {
    if (import.meta.env.SSR) {
      // When rendering the page as a static site, load these using import.
      // eslint disable-next-line
      if (fileExists('dist' + path)) {
        const json = JSON.parse(readFileSync('dist' + path));
        jsonCache[path] = json;
        return Promise.resolve(json);
      }
      return Promise.resolve(null);
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

function fetchResponseJSONSync(path) {
  if (path in jsonCache) {
    return jsonCache[path];
  }
  if (!import.meta.env.SSR) {
    return null;
  }
  const json = JSON.parse(readFileSync('dist' + path));
  jsonCache[path] = json;
  return json;
}

function fetchResponseHTML(path) {
  if (path in htmlCache) {
    return Promise.resolve(htmlCache[path]);
  }
  try {
    if (import.meta.env.SSR) {
      const html = readFileSync('dist' + path, 'utf8');
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

function fetchResponseHTMLSync(path) {
  if (path in htmlCache) {
    return htmlCache[path];
  }
  if (!import.meta.env.SSR) {
    return null;
  }
  const html = readFileSync('dist' + path, 'utf8');
  htmlCache[path] = html;
  return html;
}

export { fetchResponseJSON, fetchResponseJSONSync, fetchResponseHTML, fetchResponseHTMLSync };
