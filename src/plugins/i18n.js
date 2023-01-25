import { createI18n } from 'vue-i18n';
import { merge } from 'lodash-es';

function loadLocaleMessages() {
  const locales = import.meta.glob('../../**/locales/*.json', { eager: true });
  const messages = {};

  for (const key in locales) {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = merge(messages[locale] || {}, locales[key].default);
    }
  }
  return messages;
}

const i18n = createI18n({
  legacy: false,
  locale: import.meta.env.VITE_I18N_LOCALE || 'en',
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
});

export default i18n;
