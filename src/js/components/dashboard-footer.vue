<template lang="html">
  <v-footer color="background" class="d-print-none">
    <p class="logos text-center">
      <ExternalLink href="https://durhamnc.gov">
        <img src="../../assets/img/cityLogo.png" :alt="$t('strings.CityOfDurhamLogo')" height="125">
      </ExternalLink>
      <ExternalLink href="https://www.dataworks-nc.org">
        <img src="../../assets/img/dwLogo.png" :alt="$t('strings.DataWorksNCLogo')" height="50">
      </ExternalLink>
      <ExternalLink href="https://dconc.gov">
        <img src="../../assets/img/countyLogo.png" :alt="$t('strings.DurhamCountyLogo')" height="125">
      </ExternalLink>
    </p>
    <RouterLink :to="{name: 'about' }" class="logos overline text-center">
      {{ $t('footer.about') }}
    </RouterLink>
    <i18n path="footer.radCredit" tag="p" class="logos overline text-center">
      <template v-slot:radLink>
        <ExternalLink href="https://rad.cat">
          Research Action Design
        </ExternalLink>
      </template>
    </i18n>
  </v-footer>
</template>

<script>
import ExternalLink from "./external-link.vue";

export default {
  name: "DashboardFooter",
  components: {
    ExternalLink,
  },
};
</script>

<style lang="scss" scoped>
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
