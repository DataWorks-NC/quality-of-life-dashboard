<template>
  <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
      <input v-model="title" id="maptitle" class="mdl-textfield__input" type="text" name="maptitle" maxlength="150" aria-label="Set a custom map title">
      <label for="maptitle" class="mdl-textfield__label">Title</label>
    </div>
    <div class="mdl-layout__spacer"></div>
    <button class="mdl-button mdl-button--colored mdl-js-button mdl-button--raised" @click="print()">PRINT THIS MAP</button>
  </div>
</template>

<script>
export default {
  name: 'PrintMapHeader',
  computed: {
    title: {
      set(title) {
        this.$store.commit('setCustomLegendTitle', title);
      },
      get() {
        return this.$store.getters.legendTitle;
      },
    },
  },
  methods: {
    print() {
      window.print();
    }
  }
};
</script>

<style scoped>
.mdl-cell {
  padding: 8px;
}

@media print {
  .mdl-cell {
    display: none;
  }
}
</style>