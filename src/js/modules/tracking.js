function gaEvent(type, title, category) {
  // TODO: Can this be made async?
  if (typeof ga !== 'undefined' && ga) {
    ga('send', 'event', type, title, category);
  }
}

export { gaEvent };
