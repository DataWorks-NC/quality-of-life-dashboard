<template>
  <div>
    <v-app-bar extension-height="48" theme="dark" absolute elevation="0">
      <v-app-bar-nav-icon :aria-label="$t('strings.openMobileNav')" class="d-md-none" @click.stop="drawer = !drawer" />
      <!-- Mobile nav -->
      <v-dialog v-model="drawer" fullscreen :scrim="false" transition="dialog-bottom-transition" scrollable>
        <v-toolbar flat>
          <v-btn icon @click="drawer = false">
            <v-icon :icon="icons.mdiClose" />
          </v-btn>
          <v-toolbar-title>{{ $t('strings.chooseATopic') }}</v-toolbar-title>
        </v-toolbar>
        <v-list nav>
          <v-form @submit.prevent="focusResults()">
            <v-text-field ref="searchFieldMobile" v-model="searchText" :label="$t('search.placeholder')" variant="underlined">
              <template #prepend-inner>
                <v-icon :icon="icons.mdiMagnify" />
              </template>
              <template #append>
                <v-btn icon @click="closeSearch">
                  <v-icon :icon="icons.mdiClose" />
                </v-btn>
              </template>
            </v-text-field>
            <input type="submit" hidden>
          </v-form>
          <MetricSearchResults v-if="searchText !== ''" ref="searchResults" :search-text="searchText" mobile />
          <v-list-group v-for="category in categories" v-else :key="category.id" :value="category.id">
            <template #activator="{ props }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ category.name }}</v-list-item-title>
              </v-list-item>
            </template>
            <template v-for="m in categoryMetrics[category.originalName]">
              <v-list-item v-if="!m.children.length" :key="m.name" :value="m.name" :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }" @click="drawer = !drawer">
                <v-list-item-title> {{ m.name }} </v-list-item-title>
              </v-list-item>
              <v-list-group v-else :key="m.name" :value="`${m.name}-children`">
                <template #activator="{ props }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>{{ m.name }}</v-list-item-title>
                  </v-list-item>
                </template>
                <v-list-item v-for="m2 in m.children" :key="m2.metric" :value="m2.metric" :to="{ name: 'compass', params: { ...$route.params, metric: m2.metric }, query: $route.query }" @click="drawer = !drawer">
                  <v-list-item-title> {{ m2.name }} </v-list-item-title>
                </v-list-item>
              </v-list-group>
            </template>
          </v-list-group>
        </v-list>
      </v-dialog>

      <v-toolbar-title>
        <router-link :to="{ name: 'homepage' }">
          <img src="../../assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')" class="d-none d-md-flex">
          <img src="../../assets/img/logoMobile.png" :alt="$t('strings.DurhamNeighborhoodCompass')" class="d-none d-sm-flex d-md-none">
        </router-link>
      </v-toolbar-title>
      <div class="flex-grow-1" />
      <v-btn v-if="!isSearching" variant="text" @click="swapLanguage()">
        {{ $t('strings.ChangeLanguage') }}
      </v-btn>
      <v-btn v-if="!isSearching" icon :aria-label="$t('about.link')" :to="{ name: 'about' }">
        <v-icon :icon="icons.mdiInformation" />
      </v-btn>
      <v-btn v-if="!isSearching" icon :aria-label="$t('strings.DownloadData')" href="/download/download.zip" @click="gaEvent('send', 'event', 'download', 'metric zip file download')">
        <v-icon :icon="icons.mdiDownload" />
      </v-btn>

      <v-btn v-if="!isSearching" icon :aria-label="$t('search.search')" class="d-none d-md-block" @click.stop="openSearch">
        <v-icon :icon="icons.mdiMagnify" />
      </v-btn>
      <v-form v-else class="searchForm--desktop" role="search" @submit.prevent="focusResults()">
        <v-text-field ref="searchField" v-model="searchText" :label="$t('search.placeholder')" variant="underlined" class="searchField--desktop" type="search">
          <template #prepend-inner>
            <v-icon :icon="icons.mdiMagnify" />
          </template>
          <template #append>
            <v-btn icon @click="closeSearch">
              <v-icon :icon="icons.mdiClose" />
            </v-btn>
          </template>
        </v-text-field>
      </v-form>

      <!-- Desktop nav -->
      <template #extension>
        <v-tabs v-model="categoryTab" :mandatory="false">
          <v-tab
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </v-tab>
          <v-tab
            v-if="isSearching"
            key="searchResults"
            value="searchResults"
          >
            Search Results
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <div v-if="categoryTab" class="d-none d-md-flex">
      <v-sheet theme="light" width="100%" elevation="1">
        <v-window v-model="categoryTab" class="metric__buttons">
          <v-window-item
            v-for="category in categories"
            :key="'tab-'+category.id"
            :value="category.id"
          >
            <template v-for="m in categoryMetrics[category.originalName]" :key="kebabCase(m.originalName)">
              <template v-if="m.children.length">
                <span :id="kebabCase(m.originalName)">
                  <!-- Needed so that focus can be directed for accessibility. -->
                </span>
                <v-menu :key="m.metric || m.originalName" :attach="'#' + kebabCase(m.originalName)">
                  <template #activator="{ props }">
                    <v-btn v-if="metric.config && metric.config.subcategory === m.originalName" rounded variant="flat" class="v-btn--active" v-bind="props">
                      {{ $i18n.locale === 'es' ? metric.config.title_es : metric.config.title }} <v-icon :icon="icons.mdiTriangleSmallDown" />
                    </v-btn>
                    <v-btn v-else rounded variant="flat" v-bind="props">
                      {{ m.name }} <v-icon :icon="icons.mdiTriangleSmallDown" />
                    </v-btn>
                  </template>
                  <v-list nav dense offset-y max-height="75vh">
                    <v-list-item v-for="m2 in m.children" :key="m2.metric" :to="{ name: 'compass', params: { ...$route.params, metric: m2.metric }, query: $route.query }">
                      <v-list-item-title>
                        {{ m2.name }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
              <v-btn v-else :key="m.metric" exact rounded variant="flat" :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }">
                {{ m.name }}
              </v-btn>
            </template>
          </v-window-item>
          <v-window-item key="searchResults" value="searchResults">
            <MetricSearchResults ref="searchResults" :search-text="searchText" />
          </v-window-item>
        </v-window>
      </v-sheet>
    </div>
  </div>
</template>

<script>
import { fromPairs, kebabCase, uniq } from 'lodash-es';
import { mdiTriangleSmallDown, mdiClose, mdiDownload, mdiInformation, mdiMagnify } from '@mdi/js';

import { gaEvent } from '../helpers/tracking';
import config from '../helpers/config';
import MetricSearchResults from '@/js/components/MetricSearchResults.vue';

// TODO: Add transition where search text box slides in from the right.

// TODO: Tweak styling of search input.

export default {
  name: 'CompassNav',
  components: {MetricSearchResults},
  inject: {
    metric: {
      default: {},
    },
  },
  data: () => ({
    isSearching: false,
    searchText: '',
    categoryTab: null,
    oldCategoryTab: null,
    drawer: false,
    metricsByCategory: config.metricsByCategory,
    title: config.siteConfig.title,
    icons: {
      mdiTriangleSmallDown,
      mdiClose,
      mdiDownload,
      mdiInformation,
      mdiMagnify,
    }
  }),
  computed: {
    categories() {
      return config.categories.map(c => ({ id: c.replace(/\s+/g, ''), name: this.$t(`strings.metricCategories['${c}']`), originalName: c }))
        .sort(this.localizedSortByName);
    },

    // Return sorted array of metrics by category, with the names translated as needed.
    categoryMetrics() {
      return fromPairs(config.categories.map(c => {
        if (!(c in this.metricsByCategory)) return [c, []];

        const metrics = this.metricsByCategory[c]
          .filter(m => !m.exclude_from_map)
          .map(m => ({
            metric: m.metric, subcategory: m.subcategory, name: (this.$i18n.locale === 'es' ? m.title_es : m.title), children: [],
          }))
          .sort(this.localizedSortByName);

        const subcategories = uniq(metrics.map(m => m.subcategory).filter(a => !!a))
          .map(subcategory => ({
            name: this.$t(`strings.metricSubCategories.${subcategory}`),
            originalName: subcategory,
            children: metrics.filter(m => m.subcategory === subcategory),
          }));

        return [c, metrics
          .filter(m => !m.subcategory) // Only include metrics which have no subcategory, at this level
          // Nest child metrics under subcategories.
          .concat(subcategories)
          .sort(this.localizedSortByName),
        ];
      }));
    },
  },
  watch: {
    metric(newMetric) {
      if (newMetric.config) {
        this.categoryTab = newMetric.config.category;
      }
    }
  },
  created() {
    if (this.metric.config) {
      this.categoryTab = this.metric.config.category;
    }
  },
  methods: {
    openSearch() {
      this.isSearching = true;
      this.oldCategoryTab = this.categoryTab;
      this.categoryTab = 'searchResults';
      this.$nextTick(() => { this.$refs.searchField.$el.focus(); });
    },
    closeSearch() {
      this.isSearching = false;
      this.categoryTab = this.oldCategoryTab;
      this.searchText = '';
    },
    focusResults() {
      this.$refs.searchResults.$el.children[0].focus();
    },
    swapLanguage() {
      let newLanguage = 'es';
      if (this.$i18n.locale === 'es') {
        newLanguage = 'en';
      }
      this.$router.push({ name: this.$route.name, params: { ...this.$route.params, locale: newLanguage }, query: this.$route.query });
    },
    kebabCase,
    gaEvent,
  },
};
</script>

<style lang="scss">
.v-toolbar {
  position:relative !important;
}

.v-window {
  width: 100%;
}

.metric__buttons {
  padding: 10px;

  // Fix for vuetify clipping the dropdown menus.
  overflow: visible !important;

  .v-btn {
    text-transform: none;
    font-weight: normal;
    letter-spacing: initial;
  }
}

.v-toolbar__title img {
  margin-top: 10px;
}

// Search field.
.searchForm--desktop {
  flex: 1 1 auto;
}

.v-input {
  height: var(--v-input-control-height);
}
.searchField--desktop {
  margin-top: 1.5rem;

  .v-btn {
    margin-top: -1rem;
  }
}

@media(max-width: 959px) {
  header.v-app-bar {
    height: 60px !important;
  }
}

</style>
