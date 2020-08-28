<template>
  <v-app :style="{ backgroundColor: $vuetify.theme.themes['light'].background }">
    <router-view />
  </v-app>
</template>

<script>

export default {
  name: 'App',
};
</script>
