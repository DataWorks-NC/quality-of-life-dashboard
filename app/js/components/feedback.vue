<template lang="html">
       <div v-if="privateState.feedbackUrl != '' && privateState.signupEmbed != ''" class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop feedback">
              <div v-if="privateState.signupEmbed != ''" v-html="privateState.signupEmbed"></div>
              <button class="mdl-button mdl-js-button mdl-button--raised" v-if="privateState.feedbackUrl != ''">Feedback or questions?</button>
       </div>
</template>

<script>
export default {
    name: 'sc-feedback',
}
</script>

<style lang="css" scoped>
       button:hover {
              box-shadow:inset 0 0 0 2px rgba(0 , 104, 139, 0.4);
       }
       .feedback {
              padding: 10px;
       }
</style>
