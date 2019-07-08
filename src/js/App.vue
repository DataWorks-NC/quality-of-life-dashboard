<template>
  <router-view/>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    const Material = require('material-design-lite');
  },
};
</script>

<style>
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
