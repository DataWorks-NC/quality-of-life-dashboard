<template>
  <v-expansion-panels focusable>
    <v-expansion-panel @change="toggleMoreInfo">
      <v-expansion-panel-header>{{ collapsed ? $t('reportMoreInfo.show') : $t('reportMoreInfo.hide') }}</v-expansion-panel-header>
      <v-expansion-panel-content><div v-html="moreInfo" /></v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { fetchResponseHTML } from '../../modules/fetch';

export default {
  name: 'ReportMoreInfo',
  props: ['href'],
  data() {
    return {
      collapsed: true,
      moreInfo: 'Loading',
    };
  },
  methods: {
    toggleMoreInfo() {
      if (!this.collapsed || !this.href) {
        this.collapsed = true;
        return;
      }
      const _this = this;
      return fetchResponseHTML(this.href).then((result) => {
        _this.moreInfo = result;
        _this.collapsed = false;
      });
    },
  },
};
</script>

<style scoped>
    .metric-more-info {
        background: rgb(204, 204, 204);
    }
    .metric-more-info__title {
        padding: 3px;
        padding-left: 6px;
        color: #337ab7;
        cursor: pointer;
    }
    .metric-more-info__body {
        background: white;
        border: 3px solid rgb(204,204,204);
        padding: 6px;
    }
</style>
