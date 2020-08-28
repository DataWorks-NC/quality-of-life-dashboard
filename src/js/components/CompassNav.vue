<template lang="html">
  <div>
    <v-app-bar dark extension-height="48px">
      <!-- Mobile nav -->
      <v-dialog v-model="drawer" fullscreen hide-overlay transition="dialog-bottom-transition">
        <template v-slot:activator="{ // eslint-disable-next-line vue/no-unused-vars
          on
        }"
        >
          <v-app-bar-nav-icon :aria-label="$t('strings.openMobileNav')" class="d-md-none" @click="drawer = !drawer" />
        </template>
        <v-card dark>
          <v-toolbar flat>
            <v-btn icon @click="drawer = false">
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
            <v-toolbar-title>{{ $t('strings.chooseATopic') }}</v-toolbar-title>
          </v-toolbar>
          <v-container>
            <v-list nav dark>
              <v-list-group v-for="category in categories" :key="category.id" :value="categoryTab === `tab-${category.id}`">
                <template v-slot:activator>
                  <v-list-item-content><v-list-item-title>{{ category.name }}</v-list-item-title></v-list-item-content>
                </template>
                <template v-for="m in categoryMetrics[category.originalName]">
                  <v-list-group v-if="m.children.length" :key="m.name" sub-group :value="metric.config && metric.config.subcategory === m.originalName">
                    <template v-slot:activator>
                      <v-list-item-content>
                        <v-list-item-title>{{ m.name }}</v-list-item-title>
                      </v-list-item-content>
                    </template>
                    <v-list-item v-for="m2 in m.children" :key="m2.metric" :to="{ name: 'compass', params: { ...$route.params, metric: m2.metric }, query: $route.query }" exact link @click="drawer = !drawer">
                      <v-list-item-title>{{ m2.name }}</v-list-item-title>
                    </v-list-item>
                  </v-list-group>
                  <v-list-item v-else :key="m.metric" :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }" exact link @click="drawer = !drawer">
                    <v-list-item-title>{{ m.name }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-list-group>
            </v-list>
          </v-container>
        </v-card>
      </v-dialog>
      <v-toolbar-title>
        <router-link :to="{ name: 'homepage' }">
          <img src="../../assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')" class="d-none d-md-flex">
          <img src="../../assets/img/logoMobile.png" :alt="$t('strings.DurhamNeighborhoodCompass')" class="d-md-none">
        </router-link>
      </v-toolbar-title>
      <div class="flex-grow-1" />
      <v-btn text @click="swapLanguage()">
        {{ $t('strings.ChangeLanguage') }}
      </v-btn>
      <v-btn icon :aria-label="$t('about.link')" :to="{ name: 'about' }">
        <v-icon>{{ mdiInformation }}</v-icon>
      </v-btn>
      <v-btn icon :aria-label="$t('strings.DownloadData')" href="/download/download.zip" @click="gaEvent('send', 'event', 'download', 'metric zip file download')">
        <v-icon>{{ mdiDownload }}</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs v-model="categoryTab" show-arrows center-active optional class="d-none d-md-flex">
          <v-tab
            v-for="category in categories"
            :key="category.id"
          >
            {{ category.name }}
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <!-- Desktop nav -->
    <v-card v-if="categoryTab" class="d-none d-md-flex">
      <v-tabs-items v-model="categoryTab" class="metric__buttons">
        <v-tab-item
          v-for="category in categories"
          :key="category.id"
          :value="`tab-${category.id}`"
        >
          <template v-for="m in categoryMetrics[category.originalName]">
            <template v-if="m.children.length">
              <v-menu :key="m.metric" :attach="'#' + kebabCase(m.originalName)" offset-y>
                <template v-slot:activator="{ on }">
                  <!-- TODO: Add attach property for a11y -->
                  <v-btn v-if="metric.config && metric.config.subcategory === m.originalName" rounded depressed class="v-btn--active" v-on="on">
                    {{ $i18n.locale === 'es' ? metric.config.title_es : metric.config.title }} <v-icon>$subgroup</v-icon>
                  </v-btn>
                  <v-btn v-else rounded depressed v-on="on">
                    {{ m.name }} <v-icon>$subgroup</v-icon>
                  </v-btn>
                </template>
                <v-list nav dense offset-y max-height="75vh">
                  <v-list-item v-for="m2 in m.children" :key="m2.metric" :to="{ name: 'compass', params: { ...$route.params, metric: m2.metric }, query: $route.query }" exact link>
                    <v-list-item-title>{{ m2.name }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <span :id="kebabCase(m.originalName)" :key="`${m.originalName}-attach`" />
            </template>
            <v-btn v-else :key="m.metric" exact rounded depressed :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }">
              {{ m.name }}
            </v-btn>
          </template>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script>
import { mdiClose, mdiDownload, mdiInformation } from '@mdi/js';
import { mapState } from 'vuex';
import { fromPairs, kebabCase, uniq } from 'lodash';

import { gaEvent } from '../modules/tracking';
import config from '../modules/config';

export default {
  name: 'CompassNav',
  data: () => ({
    drawer: false,
    filterVal: null,
    metricsByCategory: config.metricsByCategory,
    title: config.siteConfig.title,
    mdiClose,
    mdiDownload,
    mdiInformation,
  }),
  computed: {
    ...mapState(['metric', 'metricId']),
    categories() {
      return config.categories.map(c => ({ id: c.replace(/\s+/g, ''), name: this.$t(`strings.metricCategories['${c}']`), originalName: c }))
        .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
    },

    // Used on navbar. Needs to supply both getter and setter so that an error is not thrown when
    // using this with v-model.
    categoryTab: {
      get() {
        let categoryId = this.filterVal && this.filterVal.id;
        if (this.filterVal === null) {
          categoryId = this.metric.config && this.metric.config.category.replace(/\s+/g, '');
        }
        return categoryId && `tab-${categoryId}`;
      },
      set(val) {
        this.filterVal = this.categories.find(c => c.id === val.replace('tab-', ''));
      },
    },
    // Return sorted array of metrics by category, with the names translated as needed.
    categoryMetrics() {
      return fromPairs(config.categories.map(c => {
        if (!(c in this.metricsByCategory)) return [c, []];

        const metrics = this.metricsByCategory[c]
          .map(m => ({
            metric: m.metric, subcategory: m.subcategory, name: (this.$i18n.locale === 'es' ? m.title_es : m.title), children: [],
          }))
          .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));

        const subcategories = uniq(metrics.map(m => m.subcategory).filter(a => !!a))
          .map(subcategory => ({
            name: this.$i18n.t(`strings.metricSubCategories.${subcategory}`),
            originalName: subcategory,
            children: metrics.filter(m => m.subcategory === subcategory),
          }));

        return [c, metrics
          .filter(m => !m.subcategory) // Only include metrics which have no subcategory, at this level
          // Nest child metrics under subcategories.
          .concat(subcategories)
          .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name)),
        ];
      }));
    },
  },
  methods: {
    swapLanguage() {
      let newLanguage = 'es';
      if (this.$i18n.locale === 'es') {
        newLanguage = 'en';
      }
      this.$router.push({ params: { ...this.$route.params, locale: newLanguage }, query: this.$route.query });
    },
    kebabCase,
    gaEvent,
  },
};
</script>

<style lang="scss" scoped>
.metric__buttons {
  padding: 10px;

  .v-btn {
    text-transform: none;
    font-weight: normal;
    letter-spacing: initial;
  }
}

.v-toolbar__title img {
  margin-top: 10px;
}

@media(max-width: 959px) {
  header.v-app-bar {
    height: 60px !important;
  }
}

</style>
