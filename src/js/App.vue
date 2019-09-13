<template>
  <v-app :style="{ backgroundColor: $vuetify.theme.themes['light'].background }">
    <div v-if="loading">
      <div style="width: 100%; height: 64px; background-color: rgb(66,66,66);" />
      <div style="width: 100%; height: 600px;" />
    </div>
    <router-view v-else />
  </v-app>
</template>

<script>
export default {
  name: 'App',
  computed: {
    loading() { return this.$root.loading; },
  },
};
</script>
