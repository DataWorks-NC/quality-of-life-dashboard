const debugLog = (msg) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(msg);
  }
};

export { debugLog };
