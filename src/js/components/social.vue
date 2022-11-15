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
import { mapState } from 'vuex';

import ExternalLink from './external-link.vue';

export default {
  name: 'Social',
  components: { ExternalLink },
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
    ...mapState({
      twitter(state) { return `https://twitter.com/intent/tweet?text=${state.metric.config ? encodeURIComponent(state.metric.config.title) : ''}&url=${this.pageUrl}`; },
    }),
  },
};
</script>

<style scoped lang="css">
.social__link {
  margin: 0 0.5em;
}
.social__link svg:hover {
  color: rgb(var(--v-theme-accent)) !important;
}
</style>
