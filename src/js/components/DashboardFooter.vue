<template>
  <v-footer color="background" class="d-print-none">
    <p class="logos text-center">
      <ExternalLink href="https://durhamnc.gov" class="no-underline">
        <img src="../../assets/img/cityLogo.png" :alt="$t('strings.CityOfDurhamLogo')" height="125">
      </ExternalLink>
      <ExternalLink href="https://www.dataworks-nc.org" class="no-underline">
        <img src="../../assets/img/dwLogo.png" :alt="$t('strings.DataWorksNCLogo')" height="50">
      </ExternalLink>
      <ExternalLink href="https://dconc.gov" class="no-underline">
        <img src="../../assets/img/countyLogo.png" :alt="$t('strings.DurhamCountyLogo')" height="125">
      </ExternalLink>
    </p>
    <RouterLink :to="{name: 'about' }" class="logos text-overline text-center">
      {{ $t('footer.about') }}
    </RouterLink>
    <i18n-t keypath="footer.radCredit" tag="p" class="logos text-overline text-center">
      <template #radLink>
        <ExternalLink href="https://rad.cat">
          Research Action Design
        </ExternalLink>
      </template>
    </i18n-t>
  </v-footer>
</template>

<script>
import ExternalLink from "./ExternalLink.vue";
import handleLinksMixin from '@/js/components/mixins/handleLinksMixin.js';

export default {
  name: "DashboardFooter",
  components: {
    ExternalLink,
  },
  mixins: [handleLinksMixin,],
};
</script>

<style lang="scss" scoped>
.v-footer {
  flex-wrap: wrap;
}

.logos {
  width: 100%;
  a::before {
    border-bottom: 0 !important;
  }
  img {
    padding: 1em;
  }
}
</style>
