<template lang="html">
  <div v-if="!printMode" class="mdl-layout__drawer mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
    <span class="mdl-layout-title">
      <a href="javascript:void(0)" @click="goHome()"><img src="../../assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')" style="width:90%"></a>
    </span>
    <nav class="mdl-navigation">
      <template v-if="filterVal">
        <a class="mdl-navigation__link" href="javascript:void(0)" @click="changeFilter(null)"><svg class="mdl-color-text--blue-grey-400 icon icon-keyboard_arrow_left navleft"><use href="#icon-keyboard_arrow_left" /></svg>{{ $t('strings.back') | capitalize }}</a>
        <template v-for="m in filteredMetrics">
          <a :key="m.metric" class="mdl-navigation__link mdl-navigation__link-end" href="javascript:void(0)" @click="changeMetric(m.metric)">{{ m.name }}</a>
        </template>
      </template>
      <template v-else>
        <span class="sidebar-title">{{ $t('sidebar.choose') }}:</span>
        <a v-for="category in categories" :key="category.id" class="mdl-navigation__link" href="javascript:void(0)" @click="changeFilter(category.originalName)">{{ category.name }}<svg class="mdl-color-text--blue-grey-400 icon icon-keyboard_arrow_right navright"><use href="#icon-keyboard_arrow_right" /></svg></a>
      </template>
    </nav>
    <nav class="mdl-navigation">
      <a class="mdl-navigation__link mdl-color-text--blue-grey-50" href="/download/download.zip" @click="ga('send', 'event', 'download', 'metric zip file download')">{{ $t('sidebar.download') }}</a>
      <a class="mdl-navigation__link mdl-color-text--blue-grey-50" @click="swapLanguage()">{{ $t('strings.ChangeLanguage') }}</a>
    </nav>
  </div>
</template>

<script>
import config from '../modules/config';

export default {
  name: 'Sidebar',
  data: () => ({
    filterVal: null,
    metricsByCategory: config.metricsByCategory,
    title: config.siteConfig.title,
  }),
  computed: {
    categories() {
      return config.categories.map(c => ({ id: c.replace(/\s+/g, ''), name: this.$t(`strings.metricCategories['${c}']`), originalName: c }))
        .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
    },
    printMode() {
      return this.$store.state.printMode;
    },
    // Return sorted array of metrics by category, with the names translated as needed.
    filteredMetrics() {
      if (this.filterVal in config.metricsByCategory) {
        return config.metricsByCategory[this.filterVal]
          .map(m => ({ metric: m.metric, name: (this.$i18n.locale === 'es' ? m.title_es : m.title) }))
          .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
      }
      return [];
    },
  },
  methods: {
    changeFilter(filter) {
      this.filterVal = filter;
    },
    hideOverlay() {
      // hide floating sidebar on metric change
      // TODO: Make more vue-y
      const drawer = document.querySelector('.mdl-layout__drawer');
      if (drawer) {
        drawer.classList.remove('is-visible');
        document.querySelector('.mdl-layout__obfuscator').classList.remove('is-visible');
      }
    },
    changeMetric(metric) {
      this.hideOverlay();
      const newParams = { ...this.$route.params, metric };
      if (!('geographyLevel' in newParams)) {
        newParams.geographyLevel = 'tract';
      }
      this.$router.push({ name: 'compass', params: newParams });
    },
    goHome() {
      this.hideOverlay();
      this.$router.push({ name: 'homepage' });
    },
    swapLanguage() {
      let newLanguage = 'es';
      if (this.$i18n.locale === 'es') {
        newLanguage = 'en';
      }
      this.$router.push({ params: { ...this.$route.params, locale: newLanguage }, query: this.$route.query });
    },
  },
};
</script>

<style lang="css" scoped>
.mdl-navigation__link {
    padding: 5px 20px !important;
}
.mdl-navigation__link-end {
    line-height: 1.3em;
    padding: 8px 20px !important;
}
.mdl-navigation__link-bottom {
    color: hsla(0,0%,100%,.75);
    text-decoration: none;
    display: inline;
    font-size: 0.9em;
}
.navright {
    padding: 0;
    margin-right: 15px !important;
    position: absolute;
    right: 0;
}
.navleft {
    margin-right: 32px;
}
.sidebar-title {
    padding: 0 20px 8px;
    color: #dce8ec;
}
.icon {
    width: 24px;
    height: 24px;
}
</style>

<style lang="css">
.mdl-navigation__link-bottom {
    color: hsla(0,0%,100%,.75);
    text-decoration: none;
    display: inline;
}
</style>
