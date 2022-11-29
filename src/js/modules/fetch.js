import 'whatwg-fetch';

const cache = {
  json: {},
  html: {},
};

let readFileSync = null;
let fileExists = null;
if (import.meta.env.SSR) {
  import('fs').then(({ readFileSync: readFileSyncFunc, existsSync }) => { readFileSync = readFileSyncFunc; fileExists = existsSync; });
}

async function fetchResponseJSON(path) {
  if (path in cache.json) {
    return Promise.resolve(cache.json[path]);
  }
  try {
    if (import.meta.env.SSR) {
      // When rendering the page as a static site, load these using import.
      // eslint disable-next-line
      if (fileExists('dist' + path)) {
        const json = JSON.parse(readFileSync('dist' + path));
        cache.json[path] = json;
        return Promise.resolve(json);
      }
      return Promise.resolve(null);
    } else {
      return fetch(path).then(response => response.json()).then((json) => {
        cache.json[path] = json;
        return json;
      });
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

function fetchResponseJSONSync(path) {
  if (path in cache.json) {
    return cache.json[path];
  }
  if (!import.meta.env.SSR) {
    return null;
  }
  const json = JSON.parse(readFileSync('dist' + path));
  cache.json[path] = json;
  return json;
}

function fetchResponseHTML(path) {
  if (path in cache.html) {
    return Promise.resolve(cache.html[path]);
  }
  try {
    if (import.meta.env.SSR) {
      const html = readFileSync('dist' + path, 'utf8');
      cache.html[path] = html;
      return Promise.resolve(html);
    } else {
      return fetch(path).then(response => response.text()).then((text) => {
        cache.html[path] = text;
        return text;
      });
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

function fetchResponseHTMLSync(path) {
  if (path in cache.html) {
    return cache.html[path];
  }
  if (!import.meta.env.SSR) {
    return null;
  }
  const html = readFileSync('dist' + path, 'utf8');
  cache.html[path] = html;
  return html;
}

export { fetchResponseJSON, fetchResponseJSONSync, fetchResponseHTML, fetchResponseHTMLSync, cache };
