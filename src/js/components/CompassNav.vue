<template lang="html">
  <div>
    <v-app-bar dark extension-height="48px">
      <v-dialog v-model="drawer" fullscreen hide-overlay transition="dialog-bottom-transition">
        <template v-slot:activator="{ on }">
          <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />
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
                <v-list-item v-for="m in categoryMetrics(category.originalName)" :key="m.metric" :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }" exact link @click="drawer = !drawer">
                  <v-list-item-title>{{ m.name }}</v-list-item-title>
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-container>
        </v-card>
      </v-dialog>
      <v-toolbar-title>
        <router-link :to="{ name: 'homepage' }">
          <img src="../../assets/img/logo.png" :alt="$t('strings.DurhamNeighborhoodCompass')">
        </router-link>
      </v-toolbar-title>
      <div class="flex-grow-1" />
      <v-btn text @click="swapLanguage()">
        {{ $t('strings.ChangeLanguage') }}
      </v-btn>
      <v-btn text href="/download/download.zip" @click="gaEvent('send', 'event', 'download', 'metric zip file download')">
        {{ $t('strings.DownloadData') }}
      </v-btn>

      <template v-slot:extension>
        <v-tabs v-model="categoryTab" show-arrows center-active optional class="d-none d-md-flex">
          <v-tab
            v-for="category in categories"
            :key="category.id"
            :href="`#tab-${category.id}`"
          >
            {{ category.name }}
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-card v-if="categoryTab" class="d-none d-md-flex">
      <v-tabs-items v-model="categoryTab" class="metric__buttons">
        <v-tab-item
          v-for="category in categories"
          :key="category.id"
          :value="`tab-${category.id}`"
        >
          <v-btn v-for="m in categoryMetrics(category.originalName)" :key="m.metric" exact rounded depressed :to="{ name: 'compass', params: { ...$route.params, metric: m.metric }, query: $route.query }">
            {{ m.name }}
          </v-btn>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script>
import { mdiClose } from '@mdi/js';
import { mapState } from 'vuex';

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
  },
  methods: {
    // Return sorted array of metrics by category, with the names translated as needed.
    categoryMetrics(categoryName) {
      if (categoryName && (categoryName in config.metricsByCategory)) {
        return config.metricsByCategory[categoryName]
          .map(m => ({ metric: m.metric, name: (this.$i18n.locale === 'es' ? m.title_es : m.title) }))
          .sort((a, b) => this.$i18n.localizedStringCompareFn(a.name, b.name));
      }
      return [];
    },
    swapLanguage() {
      let newLanguage = 'es';
      if (this.$i18n.locale === 'es') {
        newLanguage = 'en';
      }
      this.$router.push({ params: { ...this.$route.params, locale: newLanguage }, query: this.$route.query });
    },
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
