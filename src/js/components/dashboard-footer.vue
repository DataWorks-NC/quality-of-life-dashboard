<template lang="html">
  <footer class="mdl-grid">
    <div class="mdl-typography--text-center mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet">
      <p v-if="siteConfig.links" class="site-links" >
        <a v-for="link in siteConfig.links" :href="link.href" target="_blank" rel="noopener">{{ link.text }}</a>
      </p>
      <i18n path="footer.credits" tag="p">
        <a place="github" href="https://github.com/DataWorks-NC/quality-of-life-dashboard">Github</a>
        <a place="MecklenburgCounty" href="https://charmeck.org/mecklenburg/county/Pages/Default.aspx">{{ $t("strings.MecklenburgCounty") }}</a>
        <a place="Charlotte" href="https://charmeck.org/city/charlotte/Pages/default.aspx">{{ $t("strings.CityOfCharlotte")}}</a>
        <a place="UNCC" href="https://www.uncc.edu/">UNC Charlotte</a>
        <a place="OpenStreetMap" href="https://www.openstreetmap.org/" target="_blank" rel="noopener">OpenStreetMap</a>
        <a place="OSM2VectorTiles" href="https://osm2vectortiles.org/" target="_blank" rel="noopener">OSM2VectorTiles</a>
        <a place="MapboxGLJS" href="https://www.mapbox.com/mapbox-gl-js/api/" target="_blank" rel="noopener">MapboxGL JS</a>
        <a place="VueJS" href="https://vuejs.org/" target="_blank" rel="noopener">Vue.js</a>
        <a place="MDL" href="https://getmdl.io/" target="_blank" rel="noopener">Material Design Lite</a>
        <a place="CircleCI" href="https://circleci.com/" target="_blank" rel="noopener">CircleCI</a>
        <a place="BrowserStack" href="https://browserstack.com/" target="_blank" rel="noopener">BrowserStack</a>.
      </i18n>
      <p class="logos">
        <a href="https://durhamnc.gov"><img src="img/cityLogo.png" :alt="$t('strings.CityOfDurhamLogo')" height="125px"></a>
        <a href="https://www.dataworks-nc.org"><img src="img/dwLogo.png" :alt="$t('strings.DataWorksNCLogo')" height="50px"></a>
        <a href="https://dconc.gov"><img src="img/countyLogo.png" :alt="$t('strings.DurhamCountyLogo')" height="125px"></a>
      </p>
    </div>
  </footer>
</template>

<script>
import config from '../modules/config';

export default {
  name: 'Dashboard-Footer',
  data: () => ({
    siteConfig: config.siteConfig,
  }),
};
</script>

<style lang="css" scoped>
.logos img {
    padding: 1em;
}
</style>
