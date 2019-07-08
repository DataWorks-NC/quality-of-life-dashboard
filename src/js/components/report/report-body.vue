<template>
  <div>
    <ReportCategory v-for="c in categories" :key="c.name" :category="c" :metric-values="metricValues[c.name]" :county-averages="countyAverages[c.name]"/>
  </div>
</template>

<script>
// This component also tracks app state and is responsible for updating the location hash as needed.

import ReportCategory from './report-category';

import { getHash } from '../../modules/tracking';

export default {
  name: 'ReportBody',
  components: {
    ReportCategory,
  },
  computed: {
    locationHash() {
      const currentHash = [getHash(0), getHash(1), getHash(2)].map(s => s ? s : ''); // All the other components of the hash.
      const metricHash = this.categories.reduce((hash, category) => {
        if (!category.visible) {
          return {
            hash: hash.hash,
            needed: true,
          };
        } else {
          const visibleMetrics = category.metrics.filter(m => m.visible);
          const newHashPart = visibleMetrics.map(m => m.metric).join(',');
          if (visibleMetrics.length !== category.metrics.length) {
            hash.needed = true;
          }
          return {
            hash: hash.hash + newHashPart,
            needed: visibleMetrics.length !== category.metrics.length ? true : hash.needed,
          };
        }
      }, { hash: '', needed: false });
      return `${currentHash[0]}/${currentHash[1]}/${currentHash[2]}/${metricHash.needed ? metricHash.hash : ''}`;
    },
  },
  watch: {
    locationHash(newHash) { location.hash = newHash; },
  },
};
</script>

<style scoped>

</style>
