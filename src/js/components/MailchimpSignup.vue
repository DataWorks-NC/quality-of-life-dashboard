<template>
  <!-- Begin Mailchimp Signup Form -->
  <div class="signup-embed">
    <div id="mc_embed_signup">
      <form id="mc-embedded-subscribe-form" :action="url" method="post" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
        <v-text-field id="mce-EMAIL" type="email" model-value="" name="EMAIL" class="email" :placeholder="$t('feedback.email')" required />
        <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
        <div style="position: absolute; left: -5000px;" aria-hidden="true">
          <input type="text" name="b_9b69fbf4536829ebc21196618_a338a67315" tabindex="-1" value="">
        </div>
        <v-btn id="mc-embedded-subscribe" theme="dark" size="small" type="submit" value="Subscribe" name="subscribe" class="button">
          {{ $t('feedback.Subscribe') }}
        </v-btn>
      </form>
    </div>
  </div>
  <!--End mc_embed_signup-->
</template>

<script>
export default {
  name: 'MailchimpSignup',
  props: {
    url: {
      type: String,
      required: true,
    },
  },
};
</script>
<style lang="css" scoped>
.signup-embed {
  margin: 10px;
  min-height: 120px;
}

>>> #mc_embed_signup {
  font-family: "Open Sans", sans-serif;
}

>>> #mc_embed_signup .button {
  background-color: rgb(var(--v-theme-primary));
}
</style>
