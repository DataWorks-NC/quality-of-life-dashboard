<template functional>
  <a v-bind="data.attrs"
     target="_blank" rel="noopener" v-on="listeners"
  ><slot /><i v-if="props.showIcon" class="material-icons external-link-icon" :aria-label=" parent.$t('strings.opensInNewWindow')">open_in_new</i><span v-else class="screenreader-only"> {{ parent.$t('strings.opensInNewWindow') }}</span></a>
</template>

<script>
export default {
  name: 'ExternalLink',
  props: {
    showIcon: {
      type: Boolean,
      default: () => true,
    },
  },
};
</script>

<style scoped>
  .external-link-icon {
    margin: -0.5em 0.1em 0 -0.2em;
    padding: 0;
    vertical-align: middle;
    font-size: 14px;
  }
</style>
