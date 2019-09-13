<template>
  <a target="_blank" rel="noopener"><slot /><v-icon v-if="showIcon" class="material-icons external-link-icon" :aria-label=" $t('strings.opensInNewWindow')" size="14px">{{ mdiOpenInNew }}</v-icon><span v-else class="screenreader-only"> {{ $t('strings.opensInNewWindow') }}</span></a>
</template>

<script>
import { mdiOpenInNew } from "@mdi/js";

export default {
  name: 'ExternalLink',
  props: {
    showIcon: {
      type: Boolean,
      default: () => true,
    },
  },
  data: () => ({ mdiOpenInNew }),
};
</script>

<style scoped>
  .external-link-icon {
    margin: -0.5em 0.1em 0 -0.2em;
    padding: 0;
    vertical-align: middle;
  }
</style>
