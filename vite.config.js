/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify';
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { includedRoutes } from './src/includedRoutes.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    vuetify({ autoImport: true, styles: { configFile: 'src/scss/vuetify-settings.scss'} }),
    VueI18nPlugin({
      include: [resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/*.json'),resolve(dirname(fileURLToPath(import.meta.url)), './data/locales/*.json')]
    }),
    legacy(),
  //   Currently not using Vite PWA because it introduces compatibility errors with IE.
  ],
  ssr: {
    noExternal: ['vuetify', /vue-i18n/],
  },
  ssgOptions: {
    concurrency: 10,
    crittersOptions: false,
    script: 'async defer',
    formatting: 'minify',
    includedRoutes,
  },
  resolve: {
    alias: {
      "@": resolve(dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  modulePreload: {
    // See https://github.com/vitejs/vite/issues/5532 -- with this set to true, FF and Safari
    // load chunks twice.
    polyfill: false
  },
  server: {
    port: 3000,
  },
   test: {
    environment: 'jsdom'
  },
});
