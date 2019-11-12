<template lang="html">
  <v-card v-if="siteConfig && (siteConfig.feedbackUrl || siteConfig.signupEmbed)">
    <v-btn v-if="siteConfig.feedbackUrl" small @click="openSurvey">
      {{ $t('feedback.ShareFeedback') }} <v-icon size="14px">
        {{ mdiOpenInNew }}
      </v-icon>
    </v-btn>
    <v-btn v-if="siteConfig.signupEmbed" small :input-value="showSignup" @click="showSignup = !showSignup">
      {{ $t('feedback.JoinMailingList') }}
    </v-btn>
    <div v-if="showSignup" class="signup-embed" v-html="siteConfig.signupEmbed" />
  </v-card>
</template>

<script>
import { mdiOpenInNew } from "@mdi/js";
import config from '../modules/config';

export default {
  name: 'Feedback',
  data: () => ({
    showSignup: false,
    siteConfig: config.siteConfig,
    mdiOpenInNew,
  }),
  methods: {
    openSurvey() {
      window.open(config.siteConfig.feedbackUrl);
    },
  },
};
</script>

<style lang="css" scoped>
       .feedback-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
       }
       button {
          margin: 10px;
          height: auto;
          line-height: 1.5em;
          padding: 5px;
          flex: auto;
       }
       .signup-embed {
         margin: 10px;
         min-height: 120px;
       }

       >>> #mc_embed_signup {
         font-family: "Open Sans", sans-serif;
       }

       >>> #mc_embed_signup .button {
         background-color: var(--v-primary-base);
       }
</style>
