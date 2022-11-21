<template>
  <v-app :style="{ backgroundColor: $vuetify.theme.themes['light'].background }" theme="light">
    <router-view />
  </v-app>
</template>

<script>

export default {
  name: 'App',
};
</script>
