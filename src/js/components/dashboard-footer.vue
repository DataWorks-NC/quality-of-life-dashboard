<template lang="html">
  <v-footer color="background" class="d-print-none">
    <p v-if="$t('footer.links')" class="site-links text-center">
      <ExternalLink v-for="link in $t('footer.links')" :key="link.text" :href="link.href">
        {{ link.text }}
      </ExternalLink>
    </p>
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
  </v-footer>
</template>

<script>
import ExternalLink from "./external-link";

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
.material-icons {
  padding-right: 10px;
}
.mdl-cell {
  padding: 10px 10px 0;
}
.site-credits {
  width: 75%;
  margin: 15px auto 40px;

  @media (min-width: 1024px) {
    width: 50%;
  }
}
.site-links {
  width: 100%;
  margin: 25px auto;
  font-weight: 700;

  @media (min-width: 1024px) {
    width: 90%;
  }
  a {
    &:hover {
      opacity: 0.75;
    }

    & + a {
      margin-left: 10px;

      &:before {
        content: "|";
        margin-right: 10px;
      }
    }
  }
}
p:last-child {
  margin-bottom: 0;
}
</style>
