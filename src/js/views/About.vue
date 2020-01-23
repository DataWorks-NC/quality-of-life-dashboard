<template>
  <div>
    <compass-nav />
    <v-content>
      <v-container fluid grid-list-lg>
        <v-layout wrap>
          <v-flex>
            <v-card>
              <div class="flexcontainer landing-page">
                <div class="flex-item">
                  <h2>{{ $t('about.title') }}</h2>
                  <p>{{ $t('strings.about') }}</p>
                  <div v-if="$i18n.locale === 'es'">
                    <h3>SPANISH TEXT TBD</h3>
                  </div>
                  <div v-else>
                    <h3>Here's how to get started:</h3>
                  </div>

                  <i18n path="footer.credits" tag="p">
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
                </div>
              </div>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <dashboard-footer />
  </div>
</template>

<script>
import CompassNav from "../components/CompassNav.vue";
import DashboardFooter from "../components/dashboard-footer.vue";
import ExternalLink from "../components/external-link.vue";

export default {
  name: "About",
  components: {
    CompassNav,
    DashboardFooter,
    ExternalLink,
  },
  mounted() {
    this.$nextTick(() => {
      let event;
      if (typeof Event === "function") {
        event = new Event("x-app-rendered");
      } else {
        event = document.createEvent("Event");
        event.initEvent("x-app-rendered", true, true);
      }
      document.dispatchEvent(event);
    });
  },
};
</script>

<style lang="scss" scoped>
  .landing-page {
    padding: 15px 25px;

    div {
      overflow: auto;
    }

    .v-card__text {
      font-size: 1em;

      a {
        color: white;
        text-decoration: none;
        border-bottom: 2px solid rgba(255, 255, 255, 0.5);
        -webkit-transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);
        transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);

        &:hover {
          border-color:rgba(255, 255, 255, 1);
        }
      }

      @media (max-width: 767px) {
        font-size: 0.75em;
        p {
          margin-bottom: 0;
        }
      }
    }

    .v-image {
      overflow: hidden;

      @media (min-width: 768px) {
        width: 50%;
      }
    }

    .v-card.d-flex {
      @media (max-width: 767px) {
        flex-direction: column;
      }
    }

    .v-card.d-flex + .v-card.d-flex {
      margin-top: 25px;
    }

    .v-card > *:first-child:not(.v-btn):not(.v-chip) {
      border-radius: inherit;
    }

    h2 {
      font-size: 24px;
      margin-bottom: 0.75em;
      @media (max-width: 767px) {
        font-size: 20px;
      }
    }

    h3 {
      font-size: 20px;
      margin-bottom: 0.75rem;
      margin-top: 1.5em;
    }

    p {
      max-width: 680px;
    }
  }
</style>
