<template>
  <div id="metadata">
    <SetHead>
      <meta name="description" :content="metadataImportant.replace(/(<([^>]+)>)/gi, '').trim()">
      <meta name="og:description" :content="metadataImportant.replace(/(<([^>]+)>)/gi, '').trim()">
    </SetHead>
    <template v-if="metadata">
      <h3 v-if="metadataImportant">
        {{ $t('metadata.whyImportant') }}
      </h3>
      <div v-html="metadataImportant" />
      <h3 v-if="metadataAbout">
        {{ $t("metadata.about") }}
      </h3>
      <div v-html="metadataAbout" />
      <h4 v-if="metadataResources">
        {{ $t("metadata.resources") }}
      </h4>
      <div v-html="metadataResources" />
    </template>
    <div v-else style="height:350px" />
  </div>
</template>

<script>
import {fetchResponseHTML} from '@/js/helpers/fetch.js';
import handleLinksMixin from '@/js/components/mixins/handleLinksMixin.js';
import { getSubstringIndex } from '@/js/helpers/miscHelpers.js';

export default {
  name: "MetricMetadata",
  mixins: [handleLinksMixin,],
  props: {
    metricId: {
      type: String,
      required: false,
    },
    locale: {
      type: String,
      default: 'en',
    }
  },
  data() {
    return {
      metadata: null,
    }
  },
  computed: {
    metadataImportant() {
      return this.metadata ?
        this.metadata.substring(getSubstringIndex(this.metadata, '</h3>', 1) + 5,
          getSubstringIndex(this.metadata, '<h3', 2)) :
        '';
    },
    metadataResources() {
      return this.metadata ?
        this.metadata.substring(getSubstringIndex(this.metadata, '</h3>', 3) + 5,
          this.metadata.length).replace(/<table/g, '<table class="meta-table table"') :
        '';
    },
    metadataAbout() {
      return this.metadata ? this.metadata.substring(getSubstringIndex(this.metadata, '</h3>', 2) + 5, getSubstringIndex(this.metadata, '<h3', 3)) : '';
    },
  },
  async created() {
    await this.loadMetricMetadata();
  },
  async updated() {
    await this.loadMetricMetadata();
  },
  methods: {
    async loadMetricMetadata() {
      if (this.metricId) {
        const path = `/data/meta/${this.locale}/m${this.metricId}.html`;
        if (import.meta.env.SSR) {
          this.metadata = fetchResponseHTML(path);
        } else {
          this.metadata = await fetchResponseHTML(path);
        }
      }
    },
  },
};
</script>

<style lang="scss">
#metadata {
  width: 100%;
  padding: 0 10px;
}
h3 {
  margin-top: 45px;
}
h3:first-of-type {
  margin-top: 0;
}
h4 {
  margin-top: 1em;
}
.meta-table {
  width: 100%;
  white-space: normal;

  td {
    padding-top: 10px;
    padding-bottom: 10px;

    &:first-child {
      width: 25%;
      padding-right: 15px;
    }
  }
}
.meta-table:first-of-type {
  margin-bottom: 15px;
}
</style>
