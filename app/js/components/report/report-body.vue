<template>
    <div>
        <ReportCategory v-for="c in categories" :key="c.name" :category="c" :metricValues="metricValues[c.name]" :countyAverages="countyAverages[c.name]"/>
    </div>
</template>

<script>
  import ReportCategory from './report-category';

  export default {
    name: 'report-body',
    components: {
      ReportCategory,
    },
  };
</script>

<style scoped>

</style>