<template>
  <v-card>
    <p class="text-h6 text-center">
      {{ $t('strings.share') }}
    </p>
    <v-card-actions>
      <div class="flex-grow-1" />
      <ExternalLink :href="twitter" :show-icon="false" class="social__link">
        <v-icon size="36px" color="#1DA1F2" :aria-label="$t('social.twitter')" :icon="mdiTwitter" />
      </ExternalLink>
      <ExternalLink :href="facebook" :show-icon="false" class="social__link">
        <v-icon size="36px" color="#4E71A8" :aria-label="$t('social.facebook')" :icon="mdiFacebook" />
      </ExternalLink>
      <ExternalLink :href="whatsapp" :show-icon="false" class="social__link">
        <v-icon size="36px" color="#25D366" :aria-label="$t('social.linkedIn')" :icon="mdiWhatsapp" />
      </ExternalLink>
      <router-link v-if="$route.name === 'compass'" :to="{ query: { ...$route.query, mode: 'print' } }" class="social__link">
        <v-icon size="36px" color="#1686B0" :aria-label="$t('social.print')" :icon="mdiPrinter" />
      </router-link>
      <div class="flex-grow-1" />
    </v-card-actions>
  </v-card>
</template>

<script>
import {
  mdiTwitter, mdiFacebook, mdiPrinter, mdiWhatsapp,
} from '@mdi/js';

import ExternalLink from './external-link.vue';

export default {
  name: 'Social',
  components: { ExternalLink },
  inject: {
    metric: {
      default: {}
    },
  },
  data: () => ({
    baseUrl: import.meta.env.BASE_URL || 'https://compass.durhamnc.gov',
    mdiTwitter,
    mdiFacebook,
    mdiPrinter,
    mdiWhatsapp,
  }),
  computed: {
    pageUrl() { return encodeURIComponent(this.baseUrl + this.$route.fullPath); },
    facebook() { return `https://www.facebook.com/sharer.php?u=${this.pageUrl}`; },
    whatsapp() { return `https://wa.me/?text=${this.pageUrl}`; },
    twitter() { return `https://twitter.com/intent/tweet?text=${this.metric.config ? encodeURIComponent(this.metric.config.title) : ''}&url=${this.pageUrl}`; },
  },
};
</script>

<style scoped lang="scss">
a.social__link {
  -webkit-transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  margin: -0.25em 0.25em;
  padding: 0.25em;
  border-radius: 100%;

  &:hover {
    background: rgba(104, 8, 158, 0.25);
  }
}
</style>
