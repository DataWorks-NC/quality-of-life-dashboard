function computeHash(metric, selected, geography) {
  return `${metric}/${geography}/${selected.map(g => encodeURIComponent(g)).join(',')}`;
}

function gaEvent(type, title, category) {
  // TODO: Can this be made async?
  if (typeof ga !== 'undefined' && ga) {
    ga('send', 'event', type, title, category);
  }
}

function getHash(pos = 0) {
  let hash = decodeURI(location.hash).split('/');
  if (hash[pos] && hash[pos].length > 0) {
    hash[pos] = hash[pos].toString().replace('#', '');
    return decodeURIComponent(hash[pos]);
  }
  return '';
}

export { computeHash, gaEvent, getHash };
