<template>
  <div class="flex-item undermap-controls text-right">
    <v-btn
      :disabled="!selected.length"
      :to="{ query: {
        ...$route.query, selected: [], selectGroupType: undefined, selectGroupName: undefined, legendTitle: undefined
      } }"
      dark
    >
      {{ $t('undermapButtons.clear') }}
    </v-btn>
    <v-btn
      :to="{ name: 'report', params: $route.params, query: { ...$route.query, legendTitle: undefined }, hash: `#metric-${metricId}` }"
      dark
    >
      {{ $t('undermapButtons.report') }}
    </v-btn>
    <v-btn
      :to="{ query: { ...$route.query, mode: 'print' } }"
      dark
    >
      {{ $t('undermapButtons.printEmbed') }}
    </v-btn>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'UndermapButtons',
  computed: {
    ...mapState(['metricId']),
    ...mapGetters(['selected']),
  },
};
</script>

<style lang="scss" scoped>
/* Force these buttons to be purple, because something in the build process forces them back to black in production */
.theme--dark.v-btn:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: var(--v-accent-base);
}
</style>
