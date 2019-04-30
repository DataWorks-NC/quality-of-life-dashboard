<template>
  <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty">
      <input v-model="title" id="maptitle" class="mdl-textfield__input" type="text" name="maptitle" maxlength="150" aria-label="Set a custom map title" ref="maptitle">
      <label for="maptitle" class="mdl-textfield__label">Title</label>
    </div>
    <div class="mdl-layout__spacer"></div>
    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty embedcode">
      <textarea :value="embedcode" id="embedcode" class="mdl-textfield__input" type="text" name="embedcode" maxlength="200"ref="embedcode" @click="selectAndCopy()" rows="2"></textarea>
      <label for="embedcode" class="mdl-textfield__label" @click="selectAndCopy()">Copy the following code to embed this map in another website</label>
    </div>
    <div :style="showCopiedIndicator ? 'opacity: 100;' : ''" id="embedcode__copied">Text copied to clipboard!</div>
    <div class="mdl-layout__spacer"></div>
    <button class="mdl-button mdl-button--colored mdl-js-button mdl-button--raised" @click="print()">PRINT THIS MAP</button>
    <button class="mdl-button mdl-js-button mdl-button--raised" @click="returnToDashboard()">BACK TO DASHBOARD</button>
  </div>
</template>

<script>
export default {
  name: 'PrintMapHeader',
  props: [
      'config',
  ],
  data() {
    return {
      showCopiedIndicator: false,
      copiedIndicatorInterval: null,
    };
  },
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
      return `<iframe id="nbhdCompassMap" style="width: 100%; max-width: 600px; min-width: 250px; height: 600px; min-height: 600px; margin-top: 10px; margin-bottom: 10px; display: block; border-width: 0px;" scrolling="yes" src="${this.config.siteConfig.qoldashboardURL}embed.html#${this.$store.getters.urlHash.replace('print/', '')}"></iframe>`;
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
    selectAndCopy() {
      if (this.copiedIndicatorInterval) window.clearInterval(this.copiedIndicatorInterval);
      document.getElementById('embedcode').select();
      document.execCommand('copy');
      this.showCopiedIndicator = true;
      this.copiedIndicatorInterval = window.setInterval(() => { this.showCopiedIndicator = false; }, 5000);
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

.embedcode {
  cursor: pointer;
}

#embedcode__copied {
  text-align: center;
  margin-top: -20px;
  margin-bottom: 10px;
  color: #333;
  opacity: 0;
  transition: opacity 1s;
}

@media print {
  .mdl-cell {
    display: none;
  }
}
</style>
