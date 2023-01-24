<template>
  <a target="_blank" rel="noopener"><slot /><span class="screenreader-only"> {{ $t('strings.opensInNewWindow') }}</span></a>
</template>

<script>
import { mdiOpenInNew } from "@mdi/js";

export default {
  name: 'ExternalLink',
  data: () => ({ mdiOpenInNew }),
};
</script>

<style scoped>
</style>
