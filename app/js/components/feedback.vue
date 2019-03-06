<template lang="html" functional>
  <div v-if="siteConfig.feedbackUrl || siteConfig.signupEmbed" class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
    <div class="feedback-buttons">
      <button v-if="siteConfig.feedbackUrl" class="mdl-button mdl-js-button mdl-button--raised" @click="openSurvey">Share feedback or questions</button>
      <button v-if="siteConfig.signupEmbed" :class="showSignup ? 'is-active' : ''" class="mdl-button mdl-js-button mdl-button--raised" @click="showSignup = !showSignup">Join our mailing list</button>
    </div>
    <div v-if="showSignup" class="signup-embed" v-html="siteConfig.signupEmbed"/>
  </div>
</template>

<script>
import config from '../modules/config';

export default {
  name: 'Feedback',
  data: () => ({
    showSignup: false,
    siteConfig: config.siteConfig,
  }),
  methods: {
    openSurvey() {
      window.open(this.siteConfig.feedbackUrl);
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
       }
       button:hover {
              box-shadow:inset 0 0 0 2px rgba(0 , 104, 139, 0.4);
       }
       button.is-active {
              background: #00688B;
              color: white;
       }
</style>
