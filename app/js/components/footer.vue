<template lang="html">
    <footer class="mdl-grid">
        <div class="mdl-typography--text-center mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet">
            <p class="site-links" v-if="privateState.links" >
                <a v-for="link in privateState.links" v-bind:href="link.href" target="_blank" rel="noopener">{{link.text}}</a>
            </p>
            <p>
                View the Neighborhood Compass code <a href="https://github.com/DataWorks-NC/quality-of-life-dashboard">on Github</a>. Based on code created by <a href="https://charmeck.org/mecklenburg/county/Pages/Default.aspx">Mecklenburg County</a>, the <a href="https://charmeck.org/city/charlotte/Pages/default.aspx">City of Charlotte</a>, and <a href="https://www.uncc.edu/">UNC Charlotte</a>
                with much &#9829; for the projects that make this site possible:
                <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener">OpenStreetMap</a>,
                <a href="https://osm2vectortiles.org/" target="_blank" rel="noopener">OSM2VectorTiles</a>,
                <a href="https://www.mapbox.com/mapbox-gl-js/api/" target="_blank" rel="noopener">Mapbox GL JS</a>,
                <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue.js</a>, and
                <a href="https://getmdl.io/" target="_blank" rel="noopener">Material Design Lite</a>.
            </p>
            <p class="logos">
                <a href="https://durhamnc.gov"><img src="img/cityLogo.png" alt="City of Durham logo" height="125px"/></a>
                <a href="https://www.dataworks-nc.org"><img src="img/dwLogo.png" alt="DataWorks NC logo" height="50px"/></a>
                <a href="https://dconc.gov"><img src="img/countyLogo.png" alt="Durham County logo" height="125px"/></a>
            </p>
        </div>
    </footer>
</template>

<script>
import Social from './social.vue';

export default {
    name: 'sc-footer',
    components: {
        social: Social
    },
    methods: {
        social: function (socialType) {
            let _this = this;
            let pageUrl = encodeURIComponent(document.URL);
            if (socialType === 'twitter') {
                let socialUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${encodeURIComponent(_this.sharedState.metric.config.title)}`;
                window.open(socialUrl, "Share");
            }
            if (socialType === 'facebook') {
                let socialUrl = `https://www.facebook.com/sharer.php?u=${pageUrl}`;
                window.open(socialUrl, "Share");
            }
            if (socialType === 'linkedin') {
                let socialUrl = `https://www.linkedin.com/shareArticle?url=${pageUrl}`;
                window.open(socialUrl, "Share");
            }
        }
    }
}
</script>

<style lang="css" scoped>
.logos img {
    padding: 1em;
}
</style>
