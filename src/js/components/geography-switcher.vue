<template lang="html">
  <div v-if="validGeographies" id="geography-switcher" class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop geography-switcher">
    <template v-for="geography in validGeographies">
      <button :key="geography.id" :class="['mdl-chip', geography.id === selectedGeography.id ? 'is-active' : '', geography.isAvailable ? '' : 'is-disabled']" type="button" :disabled="!geography.isAvailable" @click="changeGeography(geography.id)" >
        <!--        @TODO does this need a label or for tag for accessibility? -->
        <span class="mdl-chip__text">{{ geography.name }}</span>
      </button>
    </template>
    <div class="geography-switcher--instructions">{{ $t('geographySwitcher.instructions') }}</div>
    <select-group/>
  </div>
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
  methods: {
    changeGeography(id) {
      const newParams = Object.assign(this.$route.params, { geography_level: id });
      this.$router.push({ name: 'compass', params: newParams });
    },
  },
};

</script>

<style scoped>
    .mdl-chip {
        margin: 2px;
        cursor: pointer;
    }
    .mdl-chip.is-active {
        background: #00688B;
        color: white;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
    }
    .mdl-chip.is-disabled {
        opacity: 0.25;
        cursor: inherit;
    }
    .geography-switcher {
        padding: 10px;
    }
    .geography-switcher--instructions {
        margin-top: 8px;
        font-size: 0.9em;
    }
</style>
