import { event } from 'vue-gtag';

function gaEvent(type, title, category) {
  event(type, {
    'event_category': category,
    'event_title': title,
    });
}

const debugLog = (msg) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(msg);
  }
};

export { debugLog, gaEvent };
