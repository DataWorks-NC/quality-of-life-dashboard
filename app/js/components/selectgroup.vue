<template>
  <p v-if="Object.keys(validSelectGroups).length !== 0" class="selectgroup">
    <span class="selectgroup__instructions">Or, select a</span>
    <template v-for="(group, groupKey, groupIndex) in selectGroup">
      <span v-if="groupIndex === (Object.keys(selectGroup).length - 1)" class="selectgroup__instructions">or</span>
      <button :id="`selectgroup-${groupIndex}`" :disabled="!group.hasOwnProperty(sharedState.geography.id)" class="mdl-button mdl-js-button mdl-button--primary"><span>{{ groupKey }}</span></button>
        <ul :for="`selectgroup-${groupIndex}`" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">
          <li v-for="(item, key, index) in group[sharedState.geography.id]" class="mdl-menu__item" @click="select(item, key, groupKey)">{{ key }}</li>
        </ul>
      </template>
  </p>
</template>

<script>
export default {
  name: 'Selectgroup',
  computed: {
    validSelectGroups() {
      let returnVal = {};
      const selectGroup = this.selectGroup;
      const geographyId = this.sharedState.geography.id;
      Object.keys(selectGroup).forEach(k => {
        if (selectGroup[k].hasOwnProperty(geographyId)) {
          returnVal[k] = selectGroup[k][geographyId];
        }
      });

      return returnVal;
    },
  },
  methods: {
    select(item, key, groupKey) {
      this.sharedState.selected = item;
      this.sharedState.zoomNeighborhoods = item.slice(0);
      this.sharedState.selectGroupName = `${key} (${groupKey})`;
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
