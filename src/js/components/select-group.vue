<template>
  <div v-if="validSelectGroups" id="selectgroup">
    <span>{{ $t('selectGroup.orSelectA') }}</span>
    <template v-for="(group, groupKey, groupIndex) in selectGroups" :key="groupKey">
      <span v-if="groupIndex > 0 && (groupIndex < Object.keys(selectGroups).length - 1)" style="margin-left:-0.15em;">, </span>
      <span v-if="groupIndex === (Object.keys(selectGroups).length - 1)" :key="groupKey">{{ $t('strings.or') }}</span>
      <v-menu offset-y :attach="`#selectgroup-attach-${groupIndex}`">
        <template #activator="{ on }">
          <v-btn :id="`selectgroup-${groupIndex}`" :key="`${groupKey}_button`" text class="selectgroup__button" :disabled="!group.hasOwnProperty(geography.id)" v-on="on">
            {{ $t(`selectGroup['${groupKey}']`) }}
          </v-btn>
        </template>
        <v-list :key="`selectgroup-${groupIndex}`" :for="`selectgroup-${groupIndex}`" nav dense offset-y max-height="50vh">
          <v-list-item v-for="(item, key) in group[geography.id]" :key="key" @click="select(key, groupKey)">
            <v-list-item-title>{{ $te(`selectGroup['${key}']`) ? $t(`selectGroup['${key}']`) : key }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <span :id="`selectgroup-attach-${groupIndex}`" />
    </template>
  </div>
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

<style lang="scss" scoped>
#selectgroup {
  margin-top: 10px;
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

p {
    font-size: 0.9em;
    padding-top: 0.5em;
}
</style>
