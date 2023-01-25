import 'whatwg-fetch';

let readFileSync = null;
let fileExists = null;
if (import.meta.env.SSR && (!readFileSync || !fileExists)) {
  import('node:fs').then(({ readFileSync: readFileSyncFunc, existsSync }) => { readFileSync = readFileSyncFunc; fileExists = existsSync; });
}

async function fetchResponseJSON(path) {
  if (import.meta.env.SSR) {
    // When rendering the page as a static site, load these using import.
    // eslint disable-next-line
    try {
      if (fileExists('dist' + path)) {
        return JSON.parse(readFileSync('dist' + path));
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  } else {
    try {
      return fetch(path).then(response => response.json());
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

function fetchResponseHTML(path) {
  if (import.meta.env.SSR) {
    try {
      return readFileSync('dist' + path, 'utf8');
    } catch (e) {
      console.error(e);
      return null;
    }
  } else {
    try {
      return fetch(path).then(response => response.text());
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export { fetchResponseJSON, fetchResponseHTML };
