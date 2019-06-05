import Vue from 'vue';
import VueI18n from 'vue-i18n';

const en = require('./en.json');
const es = require('./es.json');

Vue.use(VueI18n);

const messages = {
  "en": en,
  "es": es,
};

export default new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});
