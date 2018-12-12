<template>
  <p v-if="Object.keys(validSelectGroups).length !== 0">
    Or, select a
    <template v-if="group.hasOwnProperty(sharedState.geography.id)" v-for="group, groupKey, groupIndex in selectGroup">
      <a :id="`selectgroup-${groupIndex}`" href="javascript:void(0)" class="selectgroup-link">{{ groupKey }}</a>
      <ul :for="`selectgroup-${groupIndex}`" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">
        <li v-for="item, key, index in group[sharedState.geography.id]" class="mdl-menu__item" @click="select(item, key, groupKey)">{{ key }}</li>
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
/* select group */

p {
    font-size: 0.9em;
    padding-top: 0.5em;
}

.selectgroup-link {
    padding-left: 1px;
    white-space: nowrap;
    font-weight: bold;
}

.selectgroup-link::after {
    content: ", ";
    padding-right: 6px;
}

.selectgroup-link:nth-last-of-type(2)::after {
    content: "";
    padding-right: 0px;
}

.selectgroup-link:last-of-type::before {
    content: " or ";
    font-weight: normal;
    color: black;
}

.selectgroup-link:first-of-type::before {
  content: "";
}

.selectgroup-link:last-of-type::after {
    content: "";
}

</style>
