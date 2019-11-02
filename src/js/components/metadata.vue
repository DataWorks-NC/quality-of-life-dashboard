<template lang="html">
  <div id="metadata">
    <h3 v-if="metadataImportant">
      {{ $t('metadata.whyImportant') }}
    </h3>
    <div v-html="metadataImportant" />
    <h3 v-if="metadataAbout">
      {{ $t("metadata.about") }}
    </h3>
    <div v-html="metadataAbout" />
    <h4 v-if="metadataResources">
      {{ $t("metadata.resources") }}
    </h4>
    <div v-html="metadataResources" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Metadata',
  computed: mapGetters(['metadataAbout', 'metadataImportant', 'metadataResources']),
  updated() {
    this.handleLinks();
  },
  methods: {
    handleLinks() {
      const links = this.$el.getElementsByTagName('a');
      for (let i = 0; i < links.length; i += 1) {
        links[i].innerHTML = `<span class="link-underline">${links[i].innerHTML}</span>`;
      }
    },
  },
};
</script>

<style lang="css">
.meta-table {
    width: 100%;
    white-space: normal;
}
.meta-table:first-of-type {
    margin-bottom: 15px;
}
</style>

<style lang="css" scoped>
#metadata {
    width: 100%;
    padding: 0 10px;
}
h3 {
    margin-top: 45px;
}
h3:first-of-type {
    margin-top: 0;
}
h4 {
    margin-top: 1em;
}
</style>
