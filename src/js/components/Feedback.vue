<template>
  <v-card v-if="feedbackUrl || mailchimpUrl">
    <v-btn v-if="feedbackUrl" size="small" :href="feedbackUrl" target="_blank">
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
import config from '../helpers/config';
import MailchimpSignup from './MailchimpSignup.vue';

export default {
  name: 'Feedback',
  components: {
    MailchimpSignup,
  },
  data: () => ({
    showSignup: false,
    feedbackUrl: config.siteConfig.feedbackUrl,
    mailchimpUrl: config.privateConfig.mailchimpUrl,
    mdiOpenInNew,
  }),
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
