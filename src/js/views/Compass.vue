<template>
  <div id="app" class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
    <header class="mdl-layout__header mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
      <div id="sidebar-hamburger-button" aria-label="sidebar menu" aria-expanded="false" role="button" tabindex="0" class="mdl-layout__drawer-button">
        <svg class="icon icon-menu mdl-color-text--blue-grey-50"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-menu" /></svg>
      </div>
      <div class="mdl-layout__header-row">
        <span class="mdl-layout-title"><router-link :to="{ name: 'homepage' }"><img src="../../assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')"></router-link></span>
        <div class="mdl-layout-spacer" />
        <nav class="mdl-navigation mdl-layout--large-screen-only">
          <a class="mdl-navigation__link mdl-typography--text-uppercase mdl-color-text--blue-grey-50" @click="swapLanguage()">{{ $t('strings.ChangeLanguage') }}</a>
          <a class="mdl-navigation__link mdl-typography--text-uppercase mdl-color-text--blue-grey-50" href="/download/download.zip" @click="gaEvent('send', 'event', 'download', 'metric zip file download')">{{ $t('strings.DownloadData') }}</a>
        </nav>
      </div>
    </header>
    <NavSidebar />
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from './Dashboard';
import NavSidebar from '../components/sidebar';

import { gaEvent } from '../modules/tracking';

export default {
  name: 'Compass',
  components: {
    Dashboard,
    NavSidebar,
  },
  methods: {
    swapLanguage() {
      let newLanguage = 'es';
      if (this.$i18n.locale === 'es') {
        newLanguage = 'en';
      }
      this.$router.push({ params: { ...this.$route.params, locale: newLanguage }, query: this.$route.query });
    },
    gaEvent,
  },
};

</script>
