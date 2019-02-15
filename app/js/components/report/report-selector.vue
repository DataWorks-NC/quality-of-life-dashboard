<template>
  <div class="d-print-none">
    <a class="metric-selector__title" @click.prevent="collapsed=!collapsed">Customize this report</a>
    <div v-if="!collapsed" :class="collapsed ? 'collapsed' : ''" class="page page-category metric-selector">
      <div class="row metric-selector__body">
        <div class="col-xs-11">
          <p>You can customize this report to show only the metrics or categories that are relevant to your interests. Here's how:
            <ul>
              <li>Click on the title of a category to hide or show all of the metrics in that category.</li>
              <li>Click on the title of an individual metric to hide or show just that metric.</li>
              <li>If you want to choose a different part of the city to view for this report, you'll need to <a href="/">go back to the dashboard and make a new selection</a></li>
              <li>Share your customized report using the following URL: <a :href="getReportURL()" class="metric-selector__report-link">{{ getReportURL() }}</a></li>
            </ul>
          </p>
        </div>
        <div class="col-xs-1"><a @click.prevent="collapsed=true">Close</a></div>
      </div>
      <div class="row metric-selector__body">
        <div v-for="category in hiddenCategories" class="col-xs-12 col-sm-6 col-md-4">
          <div :key="category.name" class="list-group">
            <a :class="category.visible ? 'active' : ''" class="list-group-item list-group-item-action" @click.prevent="toggleCategory(category.name)">{{ category.name }}<p class="metric-selector__tip">Click to show this category</p></a>
          </div>
        </div>
      </div>
      <div class="row metric-selector__body">
        <div class="col-xs-12"><h4>Metrics shown in your report</h4>
        </div>
        <div v-for="category in visibleCategories" class="col-xs-12 col-sm-6 col-md-4">
          <div :key="category.name" class="list-group">
            <a :class="category.visible ? 'active' : ''" class="list-group-item list-group-item-action" @click.prevent="toggleCategory(category.name)">{{ category.name }}</a>
            <div v-if="category.visible" class="list-group metric-selector__sub-metrics">
              <a v-for="metric in category.metrics" :class="metric.visible ? 'active' : ''" class="list-group-item list-group-item-action metric-selector__sub-metric" @click.prevent="toggleMetric(metric)">{{ metric.title }}</a>
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
        this.categories[n].metrics.forEach((m) => { m.visible = false; });
      } else {
        // When you re-open a category, toggle all the submetrics to visible.
        this.categories[n].metrics.forEach((m) => { m.visible = true; });
        this.categories[n].visible = true;
      }
    },
    toggleMetric(metric) {
      const category = this.categories.find(c => c.name === metric.category);
      if (metric.visible) {
        category.metrics.find(m => m.metric === metric.metric).visible = false;
        if (category.metrics.every(m => !m.visible)) {
          category.visible = false;
        }
      } else {
        category.metrics.find(m => m.metric === metric.metric).visible = true;
        category.visible = true;
      }
    },
    getReportURL() {
      return `https://${location.host}${this.baseUrl}${location.hash}`;
    },
  },
};
</script>

<style scoped>
  a {
    cursor: pointer;
  }
  .metric-selector__report-link {
    word-wrap: break-word;
  }

  .collapsed {
    background: rgb(204, 204, 204);
  }
  .metric-selector__title {
    padding: 6px;
    color: #337ab7;
    cursor: pointer;
    font-weight: bold;
  }
  .metric-selector__sub-metric {
    padding: 5px 15px;
  }
  .metric-selector__sub-metric.active {
    background-color: #669ECC;
    border: #669ECC;
  }
  .metric-selector__tip {
    color: #888;
  }
</style>
