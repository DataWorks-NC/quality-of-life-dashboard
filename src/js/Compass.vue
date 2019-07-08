<template>
<div class="demo-layout mdl-layout mdl-js-layout mdl-layout--fixed-header">
  <header class="mdl-layout__header mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
    <div aria-label="sidebar menu" aria-expanded="false" role="button" tabindex="0" id="sidebar-hamburger-button" class="mdl-layout__drawer-button">
      <svg class="icon icon-menu mdl-color-text--blue-grey-50"><use xmlns:xlink="https://www.w3.org/1999/xlink" xlink:href="#icon-menu"/></svg>
    </div>
    <div class="mdl-layout__header-row">
      <span class="mdl-layout-title"><a href="./"><img src="img/logo.png" alt="Durham Neighborhood Compass"></a></span>
      <div class="mdl-layout-spacer"/>
      <div class="header-nav" style="height: 54px;">
        <nav class="mdl-navigation">
          <a class="mdl-navigation__link mdl-typography--text-uppercase mdl-color-text--blue-grey-50" @click="swapLanguage()">{{ $t('strings.changeLanguage')}}</a>
          <a class="mdl-navigation__link mdl-typography--text-uppercase mdl-color-text--blue-grey-50" @click="ga('send', 'event', 'download', 'metric zip file download')" href="/download/download.zip">Download Data</a>
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
      this.$store.watch(state => state.selected, (selected) => { this.$router.push({ query: { ...this.$route.query, selected } }); }),
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
  },
};

</script>
