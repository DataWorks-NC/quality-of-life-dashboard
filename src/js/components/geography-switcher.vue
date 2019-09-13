<template lang="html">
  <v-card v-if="validGeographies" class="geography-switcher">
    <template v-for="geography in validGeographies">
      <v-btn
        :key="geography.id"
        :disabled="!geography.isAvailable"
        :to="{ name: 'compass', params: {...$route.params, geographyLevel: geography.id }, query: $route.query }"
        rounded
      >
        {{ $t(`geographies.${geography.id}.name`) }}
      </v-btn>
    </template>
    <p class="geography-switcher--instructions">
      {{ $t('geographySwitcher.instructions') }}
    </p>
    <select-group class="geography-switcher--instructions" />
  </v-card>
</template>

<script>
import { mapState } from 'vuex';

import SelectGroup from './select-group';

import config from '../modules/config';

export default {
  name: 'GeographySwitcher',
  components: { SelectGroup },
  computed: mapState({
    selectedGeography: 'geography',
    validGeographies(state) {
      if (!state.metric.config) { return null; }
      return config.siteConfig.geographies.map(g => ({
        isAvailable: (state.metric.config.geographies.indexOf(g.id) > -1),
        id: g.id,
        name: g.name,
      }));
    },
  }),
};

</script>

<style lang="scss" scoped>
  .geography-switcher {
    .v-btn {
    text-transform: none;
    font-weight: normal;
    letter-spacing: initial;
    }
  }
  .geography-switcher--instructions {
      margin-top: 0.5em;
      font-size: 0.9em;
  }
</style>
