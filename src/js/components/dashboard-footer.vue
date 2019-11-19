<template lang="html">
  <v-footer color="background" class="d-print-none">
    <p v-if="$t('footer.links')" class="site-links text-center">
      <ExternalLink v-for="link in $t('footer.links')" :key="link.text" :href="link.href">
        {{ link.text }}
      </ExternalLink>
    </p>
    <i18n path="footer.credits" tag="p" class="site-credits text-center">
      <!-- Note: named places in i18n aren't working as described here, so the underlying footer.credits string currently uses numbered places -->
      <ExternalLink place="GitHub" href="https://github.com/DataWorks-NC/quality-of-life-dashboard">
        <span class="link-underline">GitHub</span>
      </ExternalLink>
      <ExternalLink place="MecklenburgCounty" href="https://charmeck.org/mecklenburg/county/Pages/Default.aspx">
        <span class="link-underline">{{ $t("strings.MecklenburgCounty") }}</span>
      </ExternalLink>
      <ExternalLink place="Charlotte" href="https://charmeck.org/city/charlotte/Pages/default.aspx">
        <span class="link-underline">{{ $t("strings.CityOfCharlotte") }}</span>
      </ExternalLink>
      <ExternalLink place="UNCC" href="https://www.uncc.edu/">
        <span class="link-underline">UNC Charlotte</span>
      </ExternalLink>
      <ExternalLink place="OpenStreetMap" href="https://www.openstreetmap.org/">
        <span class="link-underline">OpenStreetMap</span>
      </ExternalLink>
      <ExternalLink place="OSM2VectorTiles" href="https://osm2vectortiles.org/">
        <span class="link-underline">OSM2VectorTiles</span>
      </ExternalLink>
      <ExternalLink place="MapboxGLJS" href="https://www.mapbox.com/mapbox-gl-js/api/">
        <span class="link-underline">MapboxGL JS</span>
      </ExternalLink>
      <ExternalLink place="VueJS" href="https://vuejs.org/">
        <span class="link-underline">Vue.js</span>
      </ExternalLink>
      <ExternalLink place="MDL" href="https://getmdl.io/">
        <span class="link-underline">Material Design Lite</span>
      </ExternalLink>
      <ExternalLink place="CircleCI" href="https://circleci.com/">
        <span class="link-underline">CircleCI</span>
      </ExternalLink>
      <ExternalLink place="BrowserStack" href="https://browserstack.com/">
        <span class="link-underline">BrowserStack</span>
      </ExternalLink>.
    </i18n>
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
