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
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(msg);
  }
};

export { debugLog, gaEvent };
