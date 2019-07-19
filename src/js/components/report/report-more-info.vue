<template>
  <div class="metric-more-info">
    <div class="metric-more-info__title" @click="toggleMoreInfo">
      <h3>{{ collapsed ? $t('reportMoreInfo.show') : $t('reportMoreInfo.hide') }}</h3>
    </div>
    <div v-show="!collapsed" class="metric-more-info__body" v-html="moreInfo" />
  </div>
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
