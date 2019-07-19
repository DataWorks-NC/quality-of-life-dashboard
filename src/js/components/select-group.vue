<template>
  <p v-if="validSelectGroups" class="selectgroup">
    <span class="selectgroup__instructions">{{ $t('selectGroup.orSelectA') }}</span>
    <template v-for="(group, groupKey, groupIndex) in selectGroups">
      <span v-if="groupIndex === (Object.keys(selectGroups).length - 1)" :key="groupKey" class="selectgroup__instructions">{{ $t('strings.or') }}</span>
      <button :id="`selectgroup-${groupIndex}`" :key="`${groupKey}_button`" :disabled="!group.hasOwnProperty(geography.id)" class="mdl-button mdl-js-button mdl-button--primary">
        <span>{{ $t(`selectGroup['${groupKey}']`) }}</span>
      </button>
      <ul :key="`selectgroup-${groupIndex}`" :for="`selectgroup-${groupIndex}`" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">
        <li v-for="(item, key) in group[geography.id]" :key="key" class="mdl-menu__item" @click="select(item, key, groupKey)">
          {{ $te(`selectGroup['${key}']`) ? $t(`selectGroup['${key}']`) : key }}
        </li>
      </ul>
    </template>
  </p>
</template>

<script>
import { mapState } from 'vuex';

import config from '../modules/config';

export default {
  name: 'SelectGroup',
  data() {
    return {
      selectGroups: config.selectGroups,
    };
  },
  computed: mapState({
    geography: 'geography',
    // Returns null if there is a valid select group, non-null otherwise.
    validSelectGroups(state) {
      return Object.keys(this.selectGroups).find(g => state.geography.id in this.selectGroups[g]);
    },
  }),
  mounted() {
    // Sometimes mdl is not binding to the dropdown menus in the geography switcher, so re-run this manually.
    /* eslint-disable no-undef */
    if (typeof componentHandler !== 'undefined' && 'upgradeDom' in componentHandler) {
      componentHandler.upgradeDom();
    }
    /* eslint-enable */
  },
  methods: {
    select(item, key, groupKey) {
      const selectGroupName = `${this.$te(`selectGroup['${key}']`) ? this.$t(`selectGroup['${key}']`) : key} (${this.$t(`selectGroup['${groupKey}']`)})`;
      this.$router.push({ query: { ...this.$route.query, selected: item, reportTitle: selectGroupName } });
    },
  },
};
</script>

<style scoped>
p {
    font-size: 0.9em;
    padding-top: 0.5em;
}

.selectgroup__instructions {
  line-height: 36px;
  float: left;
}

.selectgroup button {
  padding: 0 0.5em;
  text-transform: none;
  display: inline;
  float: left;
}

</style>
