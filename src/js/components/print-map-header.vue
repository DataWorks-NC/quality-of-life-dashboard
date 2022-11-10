<template>
  <v-card>
    <v-text-field id="maptitle" ref="maptitle" v-model="title" :aria-label="$t('printMapHeader.setTitle')" name="maptitle" maxlength="150" :label="$filters.capitalize($t('strings.title'))" />

    <v-textarea id="embedcode" ref="embedcode" :model-value="embedcode" class="mdl-textfield__input" type="text" name="embedcode" maxlength="200" rows="2" :label="$t('printMapHeader.copy')" @click="selectAndCopy()" />
    <div id="embedcode__copied" :style="showCopiedIndicator ? 'opacity: 100;' : ''">
      {{ $t('printMapHeader.copied') }}
    </div>
    <v-divider />
    <div class="print__note">
      {{ $t('printMapHeader.printNote') }}
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'PrintMapHeader',
  data() {
    return {
      baseURL: import.meta.env.BASE_URL || 'https://compass.durhamnc.gov',
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
  methods: {
    selectAndCopy() {
      if (this.copiedIndicatorInterval) window.clearInterval(this.copiedIndicatorInterval);
      document.getElementById('embedcode').select();
      document.execCommand('copy');
      this.showCopiedIndicator = true;
      this.copiedIndicatorInterval = window.setInterval(() => { this.showCopiedIndicator = false; }, 5000);
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
