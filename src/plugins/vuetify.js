import 'vuetify/styles';

import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import { useI18n } from 'vue-i18n';
import i18n from './i18n';

import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

export default createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
  theme: {
    defaultTheme: 'light',
    options: {
      customProperties: true,
      variations: false,
    },
    themes: {
      light: {
        colors: {
          'surface-variant': '#016888',
          primary: '#016888',
          secondary: '#566330',
          accent: '#68089e',
          error: '#db3360',
          info: '#68089e',
          success: '#d4eb8f',
          warning: '#ce6733',
          background: '#cccccc',
        },
      },
      dark: {
        colors: {
          background: '#263238',
          primary: '#016888',
        },
      },
    },
  },
});
