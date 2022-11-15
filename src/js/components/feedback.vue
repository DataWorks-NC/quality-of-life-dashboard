<template>
  <v-card v-if="siteConfig && (siteConfig.feedbackUrl || siteConfig.signupEmbed)">
    <v-btn v-if="siteConfig.feedbackUrl" size="small" @click="openSurvey">
      {{ $t('feedback.ShareFeedback') }} <v-icon size="14px" :icon="mdiOpenInNew" />
    </v-btn>
    <v-btn v-if="mailchimpUrl" size="small" :active="showSignup" @click="showSignup = !showSignup">
      {{ $t('feedback.JoinMailingList') }}
    </v-btn>
    <MailchimpSignup v-if="showSignup" :url="mailchimpUrl" />
  </v-card>
</template>

<script>
import { mdiOpenInNew } from "@mdi/js";
import config from '../modules/config';
import MailchimpSignup from './mailchimp-signup.vue';

export default {
  name: 'Feedback',
  components: {
    MailchimpSignup,
  },
  data: () => ({
    showSignup: false,
    siteConfig: config.siteConfig,
    mailchimpUrl: config.privateConfig.mailchimpUrl,
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
</style>
