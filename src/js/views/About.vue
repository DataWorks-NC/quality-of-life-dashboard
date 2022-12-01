<template>
  <div>
    <compass-nav />
    <v-main>
      <v-container fluid grid-list-lg>
        <v-layout wrap>
          <v-row>
            <v-col cols="12" md="8">
              <v-card>
                <AboutContents />
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <Feedback />
              <div class="spacer" />
              <Social />
            </v-col>
          </v-row>
        </v-layout>
      </v-container>
    </v-main>
    <dashboard-footer />
  </div>
</template>

<script>
import CompassNav from '../components/CompassNav.vue';
import DashboardFooter from '../components/dashboard-footer.vue';
import Feedback from '../components/feedback.vue';
import Social from '../components/social.vue';
import AboutContents from '@/js/components/about-contents.vue';

export default {
  name: 'About',
  components: {
    AboutContents,
    Feedback,
    CompassNav,
    DashboardFooter,
    Social,
  },
};
</script>

<style lang="scss" scoped>
.v-main {
  padding-top: 0;
}
</style>
