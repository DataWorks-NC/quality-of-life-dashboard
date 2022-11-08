import { createI18n } from 'vue-i18n';
import { merge } from 'lodash';

function loadLocaleMessages() {
  const locales = import.meta.glob('@/(data|src)\/locales\/[A-Za-z0-9-_,\s]+\.json$/');
  const messages = {};
  for (const key in locales) {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = merge(messages[locale] || {}, locales(key));
    }
  }
  return messages;
}

const i18n = new createI18n({
  locale: import.meta.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
});

export default i18n;
