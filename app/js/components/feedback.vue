<template lang="html">
       <div v-if="privateState.feedbackUrl || privateState.signupEmbed" class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop feedback">
              <button class="mdl-button mdl-js-button mdl-button--raised" v-if="privateState.feedbackUrl" v-on:click="openSurvey">Share feedback or questions</button>
              <button v-bind:class="privateState.showSignup ? 'is-active' : ''" class="mdl-button mdl-js-button mdl-button--raised" v-if="privateState.signupEmbed" v-on:click="privateState.showSignup = !privateState.showSignup">Join our mailing list</button>
              <div v-if="privateState.showSignup" v-html="privateState.signupEmbed" class="signup-embed"></div>
       </div>
</template>

<script>
export default {
  name: 'sc-feedback',
  methods: {
    openSurvey: function() {
      window.open(this.privateState.feedbackUrl);
    },
  }
}
</script>

<style lang="css" scoped>
       button {
              margin: 10px;
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
