function gaEvent(type, title, category) {
  if (typeof window !== "undefined" && window.sa_event instanceof Function) {
      window?.sa_event(`${type}__${title}__${category}`);
  }
}

const debugLog = (msg) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(msg);
  }
};

export { debugLog, gaEvent };
