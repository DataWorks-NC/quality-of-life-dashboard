<template>
  <div>
    <compass-nav />
    <v-main>
      <v-container fluid grid-list-lg>
        <v-layout wrap>
          <v-row>
            <v-col cols="12" md="8">
              <v-card>
                <HomepageContents />
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <feedback />
              <div class="spacer" />
              <social />
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

import DashboardFooter from "../components/DashboardFooter.vue";
import Feedback from "../components/Feedback.vue";
import Social from "../components/Social.vue";
import CompassNav from "../components/CompassNav.vue";
import HomepageContents from '@/js/components/HomepageContents.vue';

export default {
  name: 'Homepage',
  components: {
    HomepageContents,
    CompassNav,
    DashboardFooter,
    Feedback,
    Social,
  },
  mixins: [getBaseMetadataMixin],
};
</script>
