<template lang="html" functional>
  <p class="text-muted">
    <a :href="twitter" :aria-label="parent.$t('social.twitter')" target="_blank" rel="noopener"><svg class="icon icon-twitter-with-circle"><use href="#icon-twitter-with-circle"/></svg></a>
    <a :href="facebook" :aria-label="parent.$t('social.facebook')" target="_blank" rel="noopener"><svg class="icon icon-facebook-with-circle"><use href="#icon-facebook-with-circle"/></svg></a>
    <a :href="linkedin" :aria-label="parent.$t('social.linkedIn')" target="_blank" rel="noopener"><svg class="icon icon-linkedin-with-circle"><use href="#icon-linkedin-with-circle"/></svg></a>
    <a :aria-label="parent.$t('social.viewGitHub')" href="https://github.com/DataWorks-NC/quality-of-life-dashboard"><svg class="icon icon-brand-github"><use href="#icon-brand-github"/></svg></a>
  </p>
</template>

<script>
import { mapState } from 'vuex';

import config from '../modules/config';

import { computeHash } from '../modules/tracking';

export default {
  name: 'Social',
  computed: mapState({
    pageUrl(state) { return `${config.siteConfig.baseURL}#${computeHash(state.metricId, state.selected, state.geography.id)}`; },
    twitter(state) { return `https://twitter.com/intent/tweet?url=${this.pageUrl}&text=${state.metric.config ? encodeURIComponent(state.metric.config.title) : ''}`; },
    facebook() { return `https://www.facebook.com/sharer.php?u=${this.pageUrl}`; },
    linkedin() { return `https://www.linkedin.com/shareArticle?url=${this.pageUrl}`; },
  }),
};
</script>

<style lang="css" scoped>
    .icon {
        width: 24px;
        height: 24px;
    }
    .icon-twitter-with-circle {
        fill: #1DA1F2;
    }
    .icon-facebook-with-circle {
        fill: #4E71A8;
    }
    .icon-linkedin-with-circle {
        fill: #1686B0;
    }
    .icon-brand-github {
        fill: #0F0F0F;
    }
</style>
