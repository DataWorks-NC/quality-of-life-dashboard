import 'whatwg-fetch';

// Node:fs is only available server-side, so in this case load the fs functions.
let readFileSync = null;
let fileExists = null;
if (import.meta.env.SSR) {
  import('node:fs').then(
    ({ readFileSync: readFileSyncFunc, existsSync }) =>
    {
      readFileSync = readFileSyncFunc;
      fileExists = existsSync;
    });
}

async function fetchResponseJSON(path) {
  // On server-side, load the JSON file synchronously from disk.
  if (import.meta.env.SSR) {
    try {
      if (fileExists('dist' + path)) {
        return JSON.parse(readFileSync('dist' + path));
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  } else {
    // Otherwise, in the browser, load it asynchronously via fetch.
    return fetch(path).then(response => response.json()).catch((e) =>
    {
      console.error(e);
      return Promise.reject(e);
    });
  }
}

function fetchResponseHTML(path) {
  // On server-side, load the HTML file synchronously from disk.
  if (import.meta.env.SSR) {
    try {
      return readFileSync('dist' + path, 'utf8');
    } catch (e) {
      console.error(e);
      return null;
    }
  } else {
    // Otherwise, in the browser, load it asynchronously via fetch.
    return fetch(path).then(response => response.text()).catch((e) =>
    {
      console.error(e);
      return Promise.reject(e);
    });
  }
}

export { fetchResponseJSON, fetchResponseHTML };
