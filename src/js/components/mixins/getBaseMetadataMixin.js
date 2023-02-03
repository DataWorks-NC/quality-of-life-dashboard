import {useHead} from '@vueuse/head';

export default {
  created() {
    useHead(
      this.baseMeta
    );
  },
  computed: {
    baseMeta() {
      const title = this.$t('strings.DurhamNeighborhoodCompass');
      const description = this.$t('strings.metaDescriptionHome');

      let enUrl = '';
      let esUrl = '';
      if (this.$i18n.locale === 'en') {
        enUrl = this.$route.path;
        esUrl = this.$router.resolve({...enUrl, params: {...enUrl.params, locale: 'es'}}).href;
      } else {
        esUrl = this.$route.path;
        enUrl = this.$router.resolve({...esUrl, params: {...esUrl.params, locale: 'en'}}).href;
      }
      return {
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
            content: import.meta.env.VITE_BASE_URL + this.$route.path,
          },
        ],
        link: [
          {
            rel: 'canonical',
            href: this.$route.path,
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
      };
    }
  }
};
