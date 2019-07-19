<template>
  <p class="text-muted">
    <ExternalLink :href="twitter" :show-icon="false">
      <svg class="icon icon-twitter-with-circle" :aria-label="$t('social.twitter')"><use href="#icon-twitter-with-circle" /></svg>
    </ExternalLink>
    <ExternalLink :href="facebook" :show-icon="false">
      <svg class="icon icon-facebook-with-circle" :aria-label="$t('social.facebook')"><use href="#icon-facebook-with-circle" /></svg>
    </ExternalLink>
    <ExternalLink :href="linkedin" :show-icon="false">
      <svg class="icon icon-linkedin-with-circle" :aria-label="$t('social.linkedIn')"><use href="#icon-linkedin-with-circle" /></svg>
    </ExternalLink>
    <ExternalLink href="https://github.com/DataWorks-NC/quality-of-life-dashboard" :show-icon="false">
      <svg class="icon icon-brand-github" :aria-label="$t('social.viewGitHub')"><use href="#icon-brand-github" /></svg>
    </ExternalLink>
  </p>
</template>

<script>
import { mapState } from 'vuex';

import config from '../modules/config';

import { computeHash } from '../modules/tracking';
import ExternalLink from './external-link';

export default {
  name: 'Social',
  components: { ExternalLink },
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
