<template>
  <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty">
      <input v-model="title" id="maptitle" class="mdl-textfield__input" type="text" name="maptitle" maxlength="150" aria-label="Set a custom map title" ref="maptitle">
      <label for="maptitle" class="mdl-textfield__label">Title</label>
    </div>
    <div class="mdl-layout__spacer"></div>
    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty">
      <textarea :value="embedcode" id="embedcode" class="mdl-textfield__input" type="text" name="embedcode" maxlength="200" aria-label="Copy code to embed this map in another website" ref="embedcode" onclick="this.select()" rows="2"></textarea>
      <label for="embedcode" class="mdl-textfield__label">Copy the following code to embed this map in another website</label>
    </div>
    <div class="mdl-layout__spacer"></div>
    <button class="mdl-button mdl-button--colored mdl-js-button mdl-button--raised" @click="print()">PRINT THIS MAP</button>
    <button class="mdl-button mdl-js-button mdl-button--raised" @click="returnToDashboard()">BACK TO DASHBOARD</button>
  </div>
</template>

<script>
export default {
  name: 'PrintMapHeader',
  props: [
      'config'
  ],
  computed: {
    title: {
      set(title) {
        this.$store.commit('setCustomLegendTitle', title);
      },
      get() {
        return this.$store.getters.legendTitle;
      },
    },
    embedcode() {
      return `<iframe id="nbhdCompassMap" style="width: 100%; max-width: 600px; min-width: 250px; height: 600px; min-height: 600px; margin-top: 10px; margin-bottom: 10px; display: block; border-width: 0px;" scrolling="yes" src="${this.config.siteConfig.qoldashboardURL}embed.html#${this.$store.getters.urlHash.replace(
          'print/', '')}"></iframe>`;
    },
  },
  mounted() {
    // Hack to force the Material Design Lite text field to think it has been edited and properly display the label.
    this.$refs.maptitle.dispatchEvent(new Event('input'));
    this.$refs.embedcode.dispatchEvent(new Event('input'));
  },
  updated() {
    // Hack to force the Material Design Lite text field to think it has been edited and properly display the label.
    this.$refs.maptitle.dispatchEvent(new Event('input'));
    this.$refs.embedcode.dispatchEvent(new Event('input'));
  },
  methods: {
    print() {
      window.print();
    },
    returnToDashboard() {
      this.$store.commit('setPrintMode', false);
    },
  },
};
</script>

<style scoped>
.mdl-textfield {
  width: 90%;
}

@media print {
  .mdl-cell {
    display: none;
  }
}
</style>
