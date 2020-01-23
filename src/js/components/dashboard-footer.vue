<template lang="html">
  <v-footer color="background" class="d-print-none">
    <p class="logos text-center">
      <ExternalLink href="https://durhamnc.gov">
        <img src="../../assets/img/cityLogo.png" :alt="$t('strings.CityOfDurhamLogo')" height="125px">
      </ExternalLink>
      <ExternalLink href="https://www.dataworks-nc.org">
        <img src="../../assets/img/dwLogo.png" :alt="$t('strings.DataWorksNCLogo')" height="50px">
      </ExternalLink>
      <ExternalLink href="https://dconc.gov">
        <img src="../../assets/img/countyLogo.png" :alt="$t('strings.DurhamCountyLogo')" height="125px">
      </ExternalLink>
    </p>
    <p class="logos overline text-center ">Site maintained by <ExternalLink href="https://rad.cat">Research Action Design</ExternalLink></p>
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
