<template>
  <div :class="collapsed ? 'collapsed' : ''" class="page page-category metric-selector d-print-none">
    <div class="row metric-selector__header">
      <div class="col-xs-12">
        <h3 class="metric-selector__title" @click="collapsed=!collapsed">Customize this report</h3>
      </div>
    </div>
    <div v-if="!collapsed">
    <div class="row metric-selector__body">
      <div class="col-xs-12">
        <p>Click on the title of a category to hide or show all of the metrics in that category. Click on the title of an individual metric to hide or show just that metric.</p>
      </div>
    </div>
      <div class="row metric-selector__body">
      <div v-for="category in hiddenCategories" class="col-xs-12 col-sm-6 col-md-4">
        <div :key="category.name" class="list-group">
          <a :class="category.visible ? 'active' : ''" class="list-group-item list-group-item-action" @click.prevent="toggleCategory(category.name)">{{ category.name }}</a>
        </div>
      </div>
      </div>
      <div class="row metric-selector__body">
      <div v-for="category in visibleCategories" class="col-xs-12 col-sm-6 col-md-4">
        <div :key="category.name" class="list-group">
          <a :class="category.visible ? 'active' : ''" class="list-group-item list-group-item-action" @click.prevent="toggleCategory(category.name)">{{ category.name }}</a>
          <div v-if="category.visible" class="list-group metric-selector__sub-metrics">
            <a v-for="metric in category.metrics" :class="metric.visible ? 'active' : ''" class="list-group-item list-group-item-action metric-selector__sub-metric" @click.prevent="metric.visible = !metric.visible">{{ metric.title }}</a>
          </div>
        </div>
      </div>
      </div>
    </div>
    </div>
</template>

<script>
export default {
  name: 'ReportSelector',
  computed: {
    visibleCategories() {
      return this.categories.filter(c => c.visible);
    },
    hiddenCategories() {
      return this.categories.filter(c => !c.visible);
    },
  },
  methods: {
    toggleCategory(categoryName) {
      const n = this.categories.findIndex(c => c.name === categoryName);
      if (this.categories[n].visible) {
        this.categories[n].visible = false;
      } else {
        // When you re-open a cataegory, toggle all the submetrics to visible.
        this.categories[n].metrics.forEach((m) => { m.visible = true; });
        this.categories[n].visible = true;
      }
    },
  },
};
</script>

<style scoped>
  .collapsed {
    background: rgb(204, 204, 204);
  }
  .metric-selector__title {
    padding: 3px;
    padding-left: 6px;
    color: #337ab7;
    cursor: pointer;
  }
  .metric-selector__sub-metric {
    padding: 5px 15px;
  }
  .metric-selector__sub-metric.active {
    background-color: #669ECC;
    border: #669ECC;
  }
</style>
