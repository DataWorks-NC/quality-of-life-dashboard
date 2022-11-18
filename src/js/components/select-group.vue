<template>
  <div v-if="validSelectGroups" id="selectgroup">
    <span>{{ $t('selectGroup.orSelectA') }}</span>
    <template v-for="(group, groupKey, groupIndex) in selectGroups" :key="groupKey">
      <span v-if="groupIndex > 0 && (groupIndex < Object.keys(selectGroups).length - 1)" style="margin-left:-0.15em;">, </span>
      <span v-if="groupIndex === (Object.keys(selectGroups).length - 1)">{{ $t('strings.or') }}</span>
      <span :id="`selectgroup-attach-${groupIndex}`" />
      <v-menu :attach="`#selectgroup-attach-${groupIndex}`">
        <template #activator="{ props }">
          <v-btn :id="`selectgroup-${groupIndex}`" variant="text" class="selectgroup__button" :disabled="!group.hasOwnProperty(geography.id)" v-bind="props">
            {{ $t(`selectGroup['${groupKey}']`) }}
          </v-btn>
        </template>
        <v-list :for="`selectgroup-${groupIndex}`" nav dense max-height="50vh">
          <v-list-item v-for="(item, key) in group[geography.id]" :key="key" @click="select(key, groupKey)">
            <v-list-item-title>{{ $t(`selectGroup['${key}']`, key, { missingWarn: false }) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import {mainStore } from '@/js/stores/index.js';
import config from '../modules/config';

export default {
  name: 'SelectGroup',
  data() {
    return {
      selectGroups: config.selectGroups,
    };
  },
  computed: mapState(mainStore, {
    geography: 'geography',
    // Returns null if there is a valid select group, non-null otherwise.
    validSelectGroups(state) {
      return Object.keys(this.selectGroups).find(g => state.geography.id in this.selectGroups[g]);
    },
  }),
  methods: {
    select(key, groupKey) {
      this.$router.push({
        query: {
          ...this.$route.query, selected: [], selectGroupName: key, selectGroupType: groupKey,
        },
      });
    },
  },
};
</script>

<style lang="scss">
.v-card.geography-switcher {
  overflow: visible;
  z-index: 10;

  p {
    font-size: 0.9em;
    padding-top: 0.5em;
  }
}

#selectgroup {
  margin-top: 10px;
  overflow: visible !important;
}

.selectgroup__button {
  &.v-btn {
    padding: 0 0.25em;
    text-transform: none;
    letter-spacing: initial;
    height: unset;
  }

  &.v-btn--text {
    &::before {
      margin: 0 0.25em;
    }
  }
}
</style>
