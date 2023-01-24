<template>
  <v-expansion-panels>
    <v-expansion-panel @group:selected="toggleMoreInfo">
      <v-expansion-panel-title>{{ collapsed ? $t('reportMoreInfo.show') : $t('reportMoreInfo.hide') }}</v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-html="moreInfo" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { fetchResponseHTML } from "../../modules/fetch";
import handleLinksMixin from '@/js/components/mixins/handleLinksMixin.js';

export default {
  name: "ReportMoreInfo",
  mixins: [handleLinksMixin,],
  props: {
    href: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      collapsed: true,
      moreInfo: this.$t('strings.loading'),
    };
  },
  methods: {
    toggleMoreInfo() {
      if (!this.collapsed || !this.href) {
        this.collapsed = true;
        return;
      }
      const _this = this;
      return fetchResponseHTML(this.href).then((result) => {
        _this.moreInfo = result;
        _this.collapsed = false;
      });
    },
  },
};
</script>

<style lang="scss">
.v-expansion-panel::before {
  opacity: 0;
}
.theme--light.v-expansion-panels button.v-expansion-panel-header {
  width: auto;
  color: rgb(var(--v-theme-accent));
  padding: 0;
  min-height: 35px;
  border-bottom: 2px solid rgba(104, 8, 158, 0);
  -webkit-transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  border-radius: 0;
  margin-bottom: 10px;

  &:hover,
  &:focus {
    border-bottom: 2px solid rgba(104, 8, 158, 0.5);
  }
  .v-expansion-panel-header__icon {
    margin-left: 5px;

    .v-icon {
      color: var(--v-accent-base);
    }
  }

  &:before {
    background-color: transparent;
  }
}
.theme--light.v-expansion-panels.v-expansion-panels--focusable
  .v-expansion-panel-header {
  &::before {
    opacity: 0;
  }
  &:hover::before,
  &:active::before {
    background-color: transparent;
  }
  .v-expansion-panel-header--active::before {
    opacity: 0;
  }
}
.v-expansion-panel-content__wrap {
  h3 {
    font-size: 1.25rem;
  }

  & > div {
    h2:first-of-type,
    p:first-of-type {
      display: none;
    }
  }

  table {
    td {
      padding-top: 10px;
      padding-bottom: 10px;

      &:first-child {
        width: 25%;
        padding-right: 15px;
      }
    }
  }
}
</style>
