import 'vuetify/styles';

import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

export default createVuetify({
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
        },
      },
    },
  },
  lang: {
    locales: ['en', 'es'],
  },
});
