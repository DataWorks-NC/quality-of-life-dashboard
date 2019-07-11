<template>
<div>
  <header class="mdl-layout__header mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
    <div aria-label="sidebar menu" aria-expanded="false" role="button" tabindex="0" id="sidebar-hamburger-button" class="mdl-layout__drawer-button">
      <svg class="icon icon-menu mdl-color-text--blue-grey-50"><use xmlns:xlink="https://www.w3.org/1999/xlink" xlink:href="#icon-menu"/></svg>
    </div>
    <div class="mdl-layout__header-row">
      <span class="mdl-layout-title"><a href="./"><img src="../assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')"></a></span>
      <div class="mdl-layout-spacer"/>
      <div class="header-nav" style="height: 54px;">
        <nav class="mdl-navigation">
          <a class="mdl-navigation__link mdl-typography--text-uppercase mdl-color-text--blue-grey-50" @click="swapLanguage()">{{ $t('strings.ChangeLanguage')}}</a>
          <a class="mdl-navigation__link mdl-typography--text-uppercase mdl-color-text--blue-grey-50" @click="gaEvent('send', 'event', 'download', 'metric zip file download')" href="/download/download.zip">{{ $t('strings.DownloadData') }}</a>
        </nav>
      </div>
    </div>
  </header>
  <NavSidebar/>
  <Dashboard/>
</div>
</template>

<script>
import Dashboard from './Dashboard';
import NavSidebar from './components/sidebar';

import { gaEvent } from './modules/tracking';

export default {
  name: 'Compass',
  components: {
    Dashboard,
    NavSidebar,
  },
  data() {
    return {
      storeWatchers: [], // List of store watcher "unwatch" callbacks to deregister on unmount.
    };
  },
  beforeRouteUpdate(to, from, next) {
    this.$store.dispatch('changeMetric', { newMetricId: to.params.metric, newGeographyId: to.params.geography_level }).then(() => {
      if ('selected' in to.query) {
        this.$store.commit('setSelected', to.query.selected);
      }
      if ('mode' in to.query && to.query.mode === 'print') {
        this.$store.commit('setPrintMode', true);
      } else {
        this.$store.commit('setPrintMode', false);
      }
      next();
    });
  },
  mounted() {
    // Set query string parameters from store.
    this.storeWatchers = [
      this.$store.watch(state => state.selected, (selected) => { if (selected && selected.length) { this.$router.push({ query: { ...this.$route.query, selected } }); } }),
      this.$store.watch(state => state.printMode, (printMode) => {
        if (printMode) {
          this.$router.push({ query: {...this.$route.query, mode: 'print' } });
        } else {
          const newQuery = Object.assign({}, this.$route.query);
          if ('mode' in newQuery) {
            delete newQuery.mode;
            this.$router.push({ query: newQuery });
          }
        }
      }),
    ];
  },
  beforeDestroy() {
    this.storeWatchers.forEach((f) => { f(); });
  },
  methods: {
    swapLanguage() {
      let newLanguage = 'es';
      if (this.$i18n.locale === 'es') {
        newLanguage = 'en';
      }
      const newRouteParams = Object.assign(this.$route.params, { locale: newLanguage });
      const newRoute = Object.assign({}, this.$route);
      this.$router.push(Object.assign(newRoute, { params: newRouteParams }));
    },
    gaEvent,
  },
};

</script>
