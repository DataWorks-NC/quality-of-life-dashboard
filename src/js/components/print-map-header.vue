<template>
  <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty">
      <input id="maptitle" ref="maptitle" v-model="title" :aria-label="$t('printMapHeader.setTitle')" class="mdl-textfield__input" type="text" name="maptitle" maxlength="150">
      <label for="maptitle" class="mdl-textfield__label">{{ $t('strings.title') | capitalize }}</label>
    </div>
    <div class="mdl-layout__spacer" />
    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty embedcode">
      <textarea id="embedcode" ref="embedcode" :value="embedcode" class="mdl-textfield__input" type="text" name="embedcode" maxlength="200" rows="2" @click="selectAndCopy()" />
      <label for="embedcode" class="mdl-textfield__label" @click="selectAndCopy()">{{ $t('printMapHeader.copy') }}</label>
    </div>
    <div id="embedcode__copied" :style="showCopiedIndicator ? 'opacity: 100;' : ''">
      {{ $t('printMapHeader.copied') }}
    </div>
    <div class="mdl-layout__spacer" />
    <button class="mdl-button mdl-button--colored mdl-js-button mdl-button--raised" @click="print()">
      {{ $t('printMapHeader.print') | allcaps }}
    </button>
    <button class="mdl-button mdl-js-button mdl-button--raised" @click="returnToDashboard()">
      {{ $t('printMapHeader.back') | allcaps }}
    </button>
    <div class="mdl-layout__spacer" />
    <div class="mdl-cell print__note">
      {{ $t('printMapHeader.printNote') }}
    </div>
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
      baseURL: process.env.VUE_APP_BASE_URL || 'https://compass.durhamnc.gov',
      showCopiedIndicator: false,
      copiedIndicatorInterval: null,
    };
  },
  computed: {
    title: {
      set(title) {
        this.$store.commit('setLegendTitle', title);
      },
      get() {
        return this.$store.getters.legendTitle;
      },
    },
    embedcode() {
      const embedURL = this.$router.resolve({ name: 'embed', params: this.$route.params, query: { ...this.$route.query, legendTitle: this.title, mode: undefined } }).href;
      return `<iframe id="nbhdCompassMap" style="width: 100%; max-width: 600px; min-width: 250px; height: 600px; min-height: 600px; margin-top: 10px; margin-bottom: 10px; display: block; border-width: 0px;" scrolling="yes" src="${this.baseURL}${embedURL}"></iframe>`;
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
      this.$router.push({ query: { ...this.$route.query, mode: undefined, legendTitle: undefined } });
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

.print__note {
  width: auto;
  font-style: italic;
  padding-bottom: 0;
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
