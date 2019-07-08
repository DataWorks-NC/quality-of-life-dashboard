<template>
  <div class="d-print-none">
    <a class="metric-selector__title" @click.prevent="collapsed=!collapsed">{{ $t('reportSelector.customize') }}</a>
    <div v-if="!collapsed" :class="collapsed ? 'collapsed' : ''" class="page page-category metric-selector">
      <div class="row metric-selector__body">
        <div class="col-xs-11">
          <p>{{ $t('reportSelector.instructionsIntro') }}
            <ul>
              <li>{{ $t('reportSelector.instructions[0]') }}</li>
              <li>{{ $t('reportSelector.instructions[1]') }}</li>
              <i18n path="reportSelector.instructions[2]" tag="li">
                <a place="goBack" href="/">{{ $t('reportSelector.goBack') }}</a>
              </i18n>
              <li>{{ $t('reportSelector.instructions[3]') }}<a :href="getReportURL()" class="metric-selector__report-link">{{ getReportURL() }}</a></li>
            </ul>
          </p>
        </div>
        <div class="col-xs-1"><a @click.prevent="collapsed=true">{{ $t('strings.close') || capitalize }}</a></div>
      </div>
      <div class="row metric-selector__body">
        <div v-for="category in hiddenCategories" class="col-xs-12 col-sm-6 col-md-4">
          <div :key="category.name" class="list-group">
            <a :class="category.visible ? 'active' : ''" class="list-group-item list-group-item-action" @click.prevent="toggleCategory(category.name)">{{ category.name }}<p class="metric-selector__tip">{{ $t('reportSelector.categoryTip') }}</p></a>
          </div>
        </div>
      </div>
      <div class="row metric-selector__body">
        <div class="col-xs-12"><h4>{{ $t('reportSelector.metricsShown') }}</h4>
        </div>
        <div v-for="category in visibleCategories" :key="category.name" class="col-xs-12 col-sm-6 col-md-4">
          <div class="list-group">
            <a :class="category.visible ? 'active' : ''" class="list-group-item list-group-item-action" @click.prevent="toggleCategory(category.name)">{{ category.name }}</a>
            <div v-if="category.visible" class="list-group metric-selector__sub-metrics">
              <a v-for="metric in category.metrics" :key="metric.metric" :class="metric.visible ? 'active' : ''" class="list-group-item list-group-item-action metric-selector__sub-metric" @click.prevent="toggleMetric(metric)">{{ metric.title }}</a>
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
