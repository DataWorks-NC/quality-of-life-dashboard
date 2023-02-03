<template>
  <div>
    <compass-nav />
    <v-main>
      <v-container fluid grid-list-lg>
        <v-layout wrap>
          <v-row>
            <v-col cols="12" md="8">
              <v-card>
                <AboutPageContents />
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
import getBaseMetadataMixin from '@/js/components/mixins/getBaseMetadataMixin.js';

import CompassNav from '../components/CompassNav.vue';
import DashboardFooter from '../components/DashboardFooter.vue';
import Feedback from '../components/Feedback.vue';
import Social from '../components/Social.vue';
import AboutPageContents from '@/js/components/AboutPageContents.vue';

export default {
  name: 'About',
  components: {
    AboutPageContents,
    Feedback,
    CompassNav,
    DashboardFooter,
    Social,
  },
  mixins: [getBaseMetadataMixin],
};
</script>

<style lang="scss" scoped>
.v-main {
  padding-top: 0;
}
</style>
