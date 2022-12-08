<template>
  <div class="flex-item undermap-controls text-right">
    <v-btn
      :disabled="!selected.length"
      :to="{ query: {
        ...$route.query, selected: [], selectGroupType: undefined, selectGroupName: undefined, legendTitle: undefined
      } }"
      theme="dark"
    >
      {{ $t('undermapButtons.clear') }}
    </v-btn>
    <v-btn
      :to="{ name: 'report', params: { locale: $i18n.locale, selectGroupType, selectGroupName }, query: { selected: selected, legendTitle: undefined }, hash: `#metric-${metric.id}` }"
      theme="dark"
    >
      {{ $t('undermapButtons.report') }}
    </v-btn>
    <v-btn
      :to="{ name: 'compass', params: $route.params, query: { ...$route.query, mode: 'print' } }"
      theme="dark"
    >
      {{ $t('undermapButtons.printEmbed') }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'UndermapButtons',
  inject: ['metric', 'selected', 'selectGroupType', 'selectGroupName'],
};
</script>

<style lang="scss" scoped>
/* Force these buttons to be purple, because something in the build process forces them back to black in production */
.theme--dark.v-btn:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: rgb(var(--v-theme-accent));
}
</style>
