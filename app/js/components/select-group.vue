<template>
  <p v-if="validSelectGroups" class="selectgroup">
    <span class="selectgroup__instructions">Or, select a</span>
    <template v-for="(group, groupKey, groupIndex) in selectGroups">
      <span v-if="groupIndex === (Object.keys(selectGroups).length - 1)" class="selectgroup__instructions">or</span>
      <button :id="`selectgroup-${groupIndex}`" :disabled="!group.hasOwnProperty(geography.id)" class="mdl-button mdl-js-button mdl-button--primary"><span>{{ groupKey }}</span></button>
      <ul :for="`selectgroup-${groupIndex}`" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">
        <li v-for="(item, key) in group[geography.id]" :key="key" class="mdl-menu__item" @click="select(item, key, groupKey)">{{ key }}</li>
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
      return Object.keys(this.selectGroups).find(g => this.selectGroups[g].hasOwnProperty(state.geography.id));
    },
  }),
  methods: {
    select(item, key, groupKey) {
      this.$store.commit('setSelected', item);
      this.$store.commit('setZoomNeighborhoods', item.slice(0)); // why??
      this.$store.commit('setSelectGroupName', `${key} (${groupKey})`);
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
