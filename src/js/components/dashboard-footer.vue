<template lang="html">
  <v-footer color="background" class="d-print-none">
    <p v-if="$t('footer.links')" class="site-links text-center">
      <ExternalLink v-for="link in $t('footer.links')" :key="link.text" :href="link.href">
        {{ link.text }}
      </ExternalLink>
    </p>
    <i18n path="footer.credits" tag="p" class="text-center">
      <!-- Note: named places in i18n aren't working as described here, so the underlying footer.credits string currently uses numbered places -->
      <ExternalLink place="GitHub" href="https://github.com/DataWorks-NC/quality-of-life-dashboard">
        GitHub
      </ExternalLink>
      <ExternalLink place="MecklenburgCounty" href="https://charmeck.org/mecklenburg/county/Pages/Default.aspx">
        {{ $t("strings.MecklenburgCounty") }}
      </ExternalLink>
      <ExternalLink place="Charlotte" href="https://charmeck.org/city/charlotte/Pages/default.aspx">
        {{ $t("strings.CityOfCharlotte") }}
      </ExternalLink>
      <ExternalLink place="UNCC" href="https://www.uncc.edu/">
        UNC Charlotte
      </ExternalLink>
      <ExternalLink place="OpenStreetMap" href="https://www.openstreetmap.org/">
        OpenStreetMap
      </ExternalLink>
      <ExternalLink place="OSM2VectorTiles" href="https://osm2vectortiles.org/">
        OSM2VectorTiles
      </ExternalLink>
      <ExternalLink place="MapboxGLJS" href="https://www.mapbox.com/mapbox-gl-js/api/">
        MapboxGL JS
      </ExternalLink>
      <ExternalLink place="VueJS" href="https://vuejs.org/">
        Vue.js
      </ExternalLink>
      <ExternalLink place="MDL" href="https://getmdl.io/">
        Material Design Lite
      </ExternalLink>
      <ExternalLink place="CircleCI" href="https://circleci.com/">
        CircleCI
      </ExternalLink>
      <ExternalLink place="BrowserStack" href="https://browserstack.com/">
        BrowserStack
      </ExternalLink>.
    </i18n>
    <p class="logos text-center">
      <ExternalLink href="https://durhamnc.gov" :show-icon="false">
        <img src="../../assets/img/cityLogo.png" :alt="$t('strings.CityOfDurhamLogo')" height="125px">
      </ExternalLink>
      <ExternalLink href="https://www.dataworks-nc.org" :show-icon="false">
        <img src="../../assets/img/dwLogo.png" :alt="$t('strings.DataWorksNCLogo')" height="50px">
      </ExternalLink>
      <ExternalLink href="https://dconc.gov" :show-icon="false">
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
.site-links {
  width: 100%;
  a + a {
    margin-left: 10px;
  }
}
p:last-child {
  margin-bottom: 0;
}
</style>
