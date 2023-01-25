<template>
  <v-app :style="{ backgroundColor: $vuetify.theme.themes['light'].background }" theme="light">
    <router-view />
  </v-app>
</template>

<script>

import {useHead} from '@vueuse/head';
import {computed} from 'vue';


export default {
  name: 'App',
  provide() {
    return {
      mapboxglLoaded: computed(() => this.mapboxglLoaded),
      mapboxgl: computed(() => this.mapboxgl),
    };
  },
  data() {
    return {
      mapboxglLoaded: false,
      mapboxgl: null,
    };
  },
  created() {
    const title = this.$t('strings.DurhamNeighborhoodCompass');
    const description = this.$t('strings.metaDescriptionHome');

    let enUrl = '';
    let esUrl = '';
    if (this.$i18n.locale === 'en') {
      enUrl = this.$route.fullPath;
      esUrl = this.$router.resolve({ ...enUrl, params: { ...enUrl.params, locale: 'es' } }).href;
    } else {
      esUrl = this.$route.fullPath;
      enUrl = this.$router.resolve({ ...esUrl, params: { ...esUrl.params, locale: 'en' } }).href;
    }

    useHead({
      title,
      meta: [
        {
          name: 'og:title',
          content: title,
        },
        {
          name: 'og:type',
          content: 'website',
        },
        {
          name: 'google-site-verification',
          content: import.meta.env.VITE_GOOGLE_SEARCH_CONSOLE_VERIFICATION,
        },
        {
          name: 'lang',
          content: this.$i18n.locale,
        },
        {
          name: 'description',
          content: description,
        },
        {
          name: 'og:description',
          content: description,
        },
        {
          name: 'og:url',
          content: import.meta.env.VITE_BASE_URL + this.$route.fullPath,
        },
      ],
      link: [
        {
          rel: 'canonical',
          href: this.$route.fullPath,
        },
        {
          rel: 'alternate',
          href: enUrl,
          hreflang: 'en',
        },

        {
          rel: 'alternate',
          href: esUrl,
          hreflang: 'es',
        }
      ]
    });
  },
  async mounted() {
    const mapboxgl = await import('mapbox-gl');
    if (!mapboxgl || !mapboxgl.prewarm) {
      return;
    }
    mapboxgl.prewarm();
    this.mapboxglLoaded = true;
    this.mapboxgl = mapboxgl;
  },
};
</script>
