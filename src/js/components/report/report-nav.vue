<template lang="html">
  <v-app-bar dark extension="tabs" class="d-print-none">
    <v-toolbar-title>
      <router-link :to="{ name: 'homepage' }">
        <img :src="require('@/assets/img/logo.png')" :alt="$t('strings.DurhamNeighborhoodCompass')">
      </router-link>
    </v-toolbar-title>
    <div class="flex-grow-1" />
    <report-selector />
    <div class="flex-grow-1" />
    <v-btn text @click="swapLanguage()">
      {{ $t('strings.ChangeLanguage') }}
    </v-btn>
    <v-btn icon :aria-label="$t('about.link')" :to="{ name: 'about' }">
      <v-icon>{{ mdiInformation }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { mdiInformation } from '@mdi/js';
import { gaEvent } from '../../modules/tracking';
import config from '../../modules/config';
import ReportSelector from './report-selector.vue';

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
