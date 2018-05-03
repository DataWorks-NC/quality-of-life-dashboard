<template lang="html">
    <div v-if="sharedState.metadata" id="metadata">
        <h3>About the Data</h3>
        <div v-html="about(sharedState.metadata)"></div>
        <h3>Why This is Important</h3>
        <div v-html="important(sharedState.metadata)"></div>
        <h4>Additional Resources</h4>
        <div v-html="resources(sharedState.metadata)"></div>
    </div>
</template>

<script>
import getSubstringIndex from '../modules/substring-nth';
import scrollTo from '../modules/scrollto';
import fetchData from '../modules/fetch.js';

export default {
    name: 'sc-metadata',
    watch: {
      'privateState.model.metricId': 'fetch'
    },
    methods: {
        important: function(data) {
            return data
            .substring(getSubstringIndex(data, '</h3>', 1) + 5, getSubstringIndex(data, '<h3', 2));;
        },
        resources: function(data) {
          return data
          .substring(getSubstringIndex(data, '</h3>', 3) + 5, data.length)
          .replace(/\<table/g, '<table class="meta-table"');
        },
        about: function(data) {
            return data.substring(getSubstringIndex(data, '</h3>', 2) + 5, getSubstringIndex(data, '<h3', 3));;
        },
        fetch: function() {
            fetchData(this.sharedState, this.privateState.model.metricId.replace('m', ''));
            scrollTo(document.querySelector('.mdl-layout__content'), 0, 600);
        }
    }
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
h3:first-of-type {
    margin-top: 0;
}
h3 {
    font-size: 2em;
}
h4 {
    font-size: 1.5em;
    margin-top: 1em;
}
</style>
