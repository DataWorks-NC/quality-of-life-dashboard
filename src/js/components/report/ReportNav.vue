<template>
  <v-app-bar theme="dark" extension="tabs" absolute class="d-print-none">
    <v-toolbar-title>
      <router-link :to="store.lastCompassRoute ? store.lastCompassRoute : { name: 'homepage', params: $route.params, query: { selected: $route.query.selected } }">
        <img src="@/assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')" class="d-none d-md-flex">
        <img src="@/assets/img/logoMobile.png" :alt="$t('strings.DurhamNeighborhoodCompass')" class="d-flex d-md-none">
      </router-link>
    </v-toolbar-title>
    <div class="flex-grow-1">
      <ClientOnly>
        <report-selector />
      </ClientOnly>
    </div>
    <v-btn variant="text" @click="swapLanguage()">
      {{ $t('strings.ChangeLanguage') }}
    </v-btn>
    <v-btn icon :aria-label="$t('about.link')" :to="{ name: 'about' }">
      <v-icon :icon="mdiInformation" />
    </v-btn>
  </v-app-bar>
</template>

<script>
import { mdiInformation } from '@mdi/js';
import { gaEvent } from '../../helpers/tracking';
import config from '../../helpers/config';
import ReportSelector from './ReportSelector.vue';

import { store } from '@/js/stores/compass-store.js';

export default {
  name: 'ReportNav',
  components: { ReportSelector },
  data: () => ({
    title: config.siteConfig.title,
    mdiInformation,
    store,
  }),
  methods: {
    swapLanguage() {
      let newLanguage = 'es';
      if (this.$i18n.locale === 'es') {
        newLanguage = 'en';
      }
      this.$router.push({ params: { ...this.$route.params, locale: newLanguage }, query: this.$route.query });
    },
    gaEvent,
  },
};
</script>

<style lang="scss">
.v-toolbar-title {
  flex: 0 0 236px;
}

// md breakpoint
@media(max-width: 1280px) {
  .v-toolbar-title {
    flex: 0 0 66px;
  }
}
</style>
