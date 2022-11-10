function gaEvent(type, title, category) {
  // TODO: Can this be made async?
  // eslint-disable-next-line no-undef
  if (typeof ga === 'undefined' || !ga) {
    return;
  }
  // eslint-disable-next-line no-undef
  ga('send', 'event', type, title, category);
}

const debugLog = (msg) => {
  if (import.meta.DEV) {
    // eslint-disable-next-line no-console
    console.log(msg);
  }
};

export { debugLog, gaEvent };
