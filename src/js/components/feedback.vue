<template lang="html">
  <v-card v-if="siteConfig && (siteConfig.feedbackUrl || siteConfig.signupEmbed)">
    <v-btn v-if="siteConfig.feedbackUrl" small @click="openSurvey">
      {{ $t('feedback.ShareFeedback') }} <v-icon size="14px">
        {{ mdiOpenInNew }}
      </v-icon>
    </v-btn>
    <v-btn small :input-value="showSignup" @click="showSignup = !showSignup">
      {{ $t('feedback.JoinMailingList') }}
    </v-btn>
    <div v-if="showSignup" class="signup-embed">
      <!-- Begin Mailchimp Signup Form -->
      <div id="mc_embed_signup">
        <form id="mc-embedded-subscribe-form" action="https://dataworks-nc.us18.list-manage.com/subscribe/post?u=9b69fbf4536829ebc21196618&amp;id=a338a67315" method="post" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
          <v-text-field id="mce-EMAIL" type="email" value="" name="EMAIL" class="email" placeholder="email address" required />
          <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
          <div style="position: absolute; left: -5000px;" aria-hidden="true">
            <input type="text" name="b_9b69fbf4536829ebc21196618_a338a67315" tabindex="-1" value="">
          </div>
          <v-btn id="mc-embedded-subscribe" dark small type="submit" value="Subscribe" name="subscribe" class="button">
            Subscribe
          </v-btn>
        </form>
      </div>
      <!--End mc_embed_signup-->
    </div>
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
