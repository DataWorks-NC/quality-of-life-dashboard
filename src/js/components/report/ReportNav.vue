<template>
  <v-app-bar theme="dark" extension="tabs" absolute class="d-print-none">
    <v-toolbar-title>
      <router-link :to="{ name: 'homepage' }">
        <img src="@/assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')">
      </router-link>
    </v-toolbar-title>
    <div class="flex-grow-1" />
    <ClientOnly>
      <report-selector />
    </ClientOnly>
    <div class="flex-grow-1" />
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
import { gaEvent } from '../../modules/tracking';
import config from '../../modules/config';
import ReportSelector from './ReportSelector.vue';

export default {
  name: 'ReportNav',
  components: { ReportSelector },
  data: () => ({
    title: config.siteConfig.title,
    mdiInformation,
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
