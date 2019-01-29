<template lang="html">
  <div class="demo-drawer mdl-layout__drawer mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
    <header class="demo-drawer-header">
      <a href="./">TITLE GOES HERE</a>
    </header>
  <nav class="demo-navigation mdl-navigation mdl-color--blue-grey-900">
    <template v-if="filterVal">
      <a class="mdl-navigation__link" href="javascript:void(0)" @click="changeFilter(null)"><svg class="mdl-color-text--blue-grey-400 icon icon-keyboard_arrow_left navleft"><use href="#icon-keyboard_arrow_left"/></svg>Back</a>
      <template v-for="m in filteredMetrics">
        <a class="mdl-navigation__link mdl-navigation__link-end" href="javascript:void(0)" @click="changeMetric(m.metric)">{{ m.title }}</a>
      </template>
    </template>
    <template v-else >
      <span class="sidebar-title">Explore the Data</span>
      <template v-for="category in categories">
        <a class="mdl-navigation__link" href="javascript:void(0)" @click="changeFilter(category)">{{ category }}<svg class="mdl-color-text--blue-grey-400 icon icon-keyboard_arrow_right navright"><use href="#icon-keyboard_arrow_right"/></svg></a>
      </template>
      <a class="mdl-navigation__link" download="downloads/qol-data.zip" @click="ga('send', 'event', 'download', 'metric zip file download')" >Download Data</a>
    </template>
  </nav>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Sidebar',
  data: () => ({
    filterVal: null,
  }),
  computed: mapState({
    categories: 'categories',
    metricsByCategory: 'metricsByCategory',
    filteredMetrics(state) {
      return state.metricsByCategory[this.filterVal];
    },
  }),
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
      this.$store.dispatch('changeMetric', metric);
      this.hideOverlay();
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
