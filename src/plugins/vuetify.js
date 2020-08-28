import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import minifyTheme from 'minify-css-string';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
      minifyTheme,
      variations: false,
    },
    themes: {
      light: {
        primary: '#016888',
        secondary: '#566330',
        accent: '#68089e',
        error: '#db3360',
        info: '#68089e',
        success: '#d4eb8f',
        warning: '#ce6733',
        background: '#cccccc',
      },
      dark: {
        background: '#263238',
      },
    },
  },
  lang: {
    locales: ['en', 'es'],
  },
  icons: {
    iconfont: 'mdiSvg',
  },
});
