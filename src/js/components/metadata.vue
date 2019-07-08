<template lang="html">
  <div v-if="metadata" id="metadata">
    <h3>{{ $t('metadata.whyImportant') }}</h3>
    <div v-html="important"/>
    <h3>{{ $t("metadata.about") }}</h3>
    <div v-html="about"/>
    <h4>{{ $t("metadata.resources") }}</h4>
    <div v-html="resources"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import getSubstringIndex from '../modules/substring-nth';

// TODO: Simplify this code!
export default {
  name: 'Metadata',
  computed: mapState({
    metadata: 'metadata',
    important: state => state.metadata.substring(getSubstringIndex(state.metadata, '</h3>', 1) + 5, getSubstringIndex(state.metadata, '<h3', 2)),
    resources: state => state.metadata.substring(getSubstringIndex(state.metadata, '</h3>', 3) + 5, state.metadata.length).replace(/\<table/g, '<table class="meta-table table"'),
    about: state => state.metadata.substring(getSubstringIndex(state.metadata, '</h3>', 2) + 5, getSubstringIndex(state.metadata, '<h3', 3))

  }),
  // TODO is this still needed after fetch? scrollTo(document.querySelector('.mdl-layout__content'), 0, 600);
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
    font-size: 2em;
    margin-top: 45px;
}
h3:first-of-type {
    margin-top: 0;
}
h4 {
    font-size: 1.5em;
    margin-top: 1em;
}
</style>
