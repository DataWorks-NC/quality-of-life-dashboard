<template>
  <v-card>
    <v-text-field id="maptitle" ref="maptitle" v-model="title" :aria-label="$t('printMapHeader.setTitle')" name="maptitle" maxlength="150" :label="$filters.capitalize($t('strings.title'))" />

    <div @click.stop="selectAndCopy">
      <v-textarea id="embedcode" ref="embedcode" :model-value="embedCode" class="mdl-textfield__input" no-resize type="text" name="embedcode" maxlength="200" rows="2" :label="$t('printMapHeader.copy')" />
      <div id="embedcode__copied" :style="showCopiedIndicator ? 'opacity: 100;' : 'opacity: 0;'">
        {{ $t('printMapHeader.copied') }}
      </div>
    </div>
    <div class="print__note">
      {{ $t('printMapHeader.printNote') }}
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'PrintMapHeader',
  inject: ['legendTitle'],
  data() {
    return {
      baseURL: import.meta.env.VITE_BASE_URL || 'https://compass.durhamnc.gov',
      showCopiedIndicator: false,
      copiedIndicatorInterval: null,
      embedUrl: null,
    };
  },
  computed: {
    title: {
      // TODO: Fix.
      set(title) {
        this.$router.replace({ ...this.$route, query: { ...this.$route.query, legendTitle: title } });
        this.embedUrl = this.$router.resolve({ name: 'embed', params: this.$route.params, query: { ...this.$route.query, legendTitle: title, mode: undefined } }).href;
      },
      get() {
        return this.legendTitle;
      },
    },
    embedCode() {
      return `<iframe id="nbhdCompassMap" style="width: 100%; max-width: 600px; min-width: 250px; height: 600px; min-height: 600px; margin-top: 10px; margin-bottom: 10px; display: block; border-width: 0px;" scrolling="yes" src="${this.baseURL.replace(/\/$/,'')}${this.embedUrl}"></iframe>`;
    },
  },
  mounted() {
    this.embedUrl = this.$router.resolve({ name: 'embed', params: this.$route.params, query: { ...this.$route.query, legendTitle: this.legendTitle, mode: undefined } }).href;
  },
  methods: {
    selectAndCopy() {
      if (this.copiedIndicatorInterval) window.clearInterval(this.copiedIndicatorInterval);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.embedCode).then(() => {
          this.showCopiedIndicator = true;
          this.copiedIndicatorInterval = window.setInterval(() => { this.showCopiedIndicator = false; }, 5000);
        })
      }
      else {
        document.getElementById('embedcode').select();
        document.execCommand('copy');
        this.showCopiedIndicator = true;
        this.copiedIndicatorInterval = window.setInterval(() => { this.showCopiedIndicator = false; }, 5000);
      }
    },
  },
};
</script>

<style scoped>
.embedcode {
  cursor: pointer;
}

.print__note {
  width: auto;
  font-style: italic;
  padding-bottom: 0;
}

#embedcode {
  overflow: hidden;
}

#embedcode__copied {
  text-align: center;
  margin-top: -20px;
  margin-bottom: 10px;
  color: #333;
  background: #fff;
  transition: opacity 1s;
}

@media print {
  .mdl-cell {
    display: none;
  }
}
</style>
