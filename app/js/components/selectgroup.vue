<template>
  <p v-if="selectGroup && typeof selectGroup === 'object'">
    Or, select a
    <template v-for="group, key, index in selectGroup" v-if="group.hasOwnProperty(sharedState.geography.id)">
      <a :id="`selectgroup-${index}`" href="javascript:void(0)" class="selectgroup-link">{{ key }}</a>
      <ul :for="`selectgroup-${index}`" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">
        <li v-for="item, key, index in group[sharedState.geography.id]" class="mdl-menu__item" @click="select(item)">{{ key }}</li>
      </ul>
    </template>
  </p>
</template>

<script>
export default {
  name: 'Selectgroup',
  methods: {
    select(item) {
      this.sharedState.selected = item;
      this.sharedState.zoomNeighborhoods = item.slice(0);
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
}

.selectgroup-link:last-of-type::after {
    content: "";
}

</style>
