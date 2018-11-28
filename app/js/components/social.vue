<template lang="html">
  <p class="text-muted">
    <a :href="twitter" aria-label="Share on Twitter" target="_blank" rel="noopener"><svg class="icon icon-twitter-with-circle"><use href="#icon-twitter-with-circle"/></svg></a>
    <a :href="facebook" aria-label="Share on Facebook" target="_blank" rel="noopener"><svg class="icon icon-facebook-with-circle"><use href="#icon-facebook-with-circle"/></svg></a>
    <a :href="linkedin" aria-label="Share on LinkedIn" target="_blank" rel="noopener"><svg class="icon icon-linkedin-with-circle"><use href="#icon-linkedin-with-circle"/></svg></a>
    <a href="https://github.com/DataWorks-NC/quality-of-life-dashboard" aria-label="View project on Github"><svg class="icon icon-brand-github"><use href="#icon-brand-github"/></svg></a>
  </p>
</template>

<script>
import { computeHash } from '../modules/tracking';

export default {
  name: 'ScSocial',
  computed: {
    pageUrl() { return this.privateState.baseURL + computeHash(this.sharedState.metricId, this.sharedState.selected, this.sharedState.geography.id); },
    twitter() { return `https://twitter.com/intent/tweet?url=${this.pageUrl}&text=${this.sharedState.metric.config ? encodeURIComponent(this.sharedState.metric.config.title) : ''}`; },
    facebook() { return `https://www.facebook.com/sharer.php?u=${this.pageUrl}`; },
    linkedin() { return `https://www.linkedin.com/shareArticle?url=${this.pageUrl}`; },
  },
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
