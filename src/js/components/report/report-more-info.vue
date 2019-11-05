<template>
  <v-expansion-panels focusable>
    <v-expansion-panel @change="toggleMoreInfo">
      <v-expansion-panel-header>{{ collapsed ? $t('reportMoreInfo.show') : $t('reportMoreInfo.hide') }}</v-expansion-panel-header>
      <v-expansion-panel-content>
        <div v-html="moreInfo" />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { fetchResponseHTML } from "../../modules/fetch";

export default {
  name: "ReportMoreInfo",
  props: ["href"],
  data() {
    return {
      collapsed: true,
      moreInfo: "Loading",
    };
  },
  updated() {
    this.handleLinks();
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
    handleLinks() {
      const links = this.$el.getElementsByTagName("a");
      for (let i = 0; i < links.length; i += 1) {
        links[
          i
        ].innerHTML = `<span class="link-underline">${links[i].innerHTML}</span>`;
      }
    },
  },
};
</script>

<style lang="scss">
.metric-more-info {
  background: rgb(204, 204, 204);
}
.metric-more-info__title {
  padding: 3px;
  padding-left: 6px;
  color: #337ab7;
  cursor: pointer;
}
.metric-more-info__body {
  background: white;
  border: 3px solid rgb(204, 204, 204);
  padding: 6px;
}
.v-expansion-panel::before {
  opacity: 0;
}
.theme--light.v-expansion-panels button.v-expansion-panel-header {
  width: auto;
  color: var(--v-accent-base);
  padding-left: 0;
  .v-expansion-panel-header__icon {
    margin-left: 5px;

    .v-icon {
      color: var(--v-accent-base);
    }
  }
}
.theme--light.v-expansion-panels.v-expansion-panels--focusable
  .v-expansion-panel-header {
  &::before {
    opacity: 0;
    transition: none;
  }
  &:hover::before,
  &:active::before {
    background-color: transparent;
  }
  &:focus::before {
    opacity: 1;
    outline: 5px auto #5e9ed6;
    background-color: transparent;
  }
}
.v-expansion-panel-content__wrap {
  h2,
  h3 {
    font-size: 1.25em;
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
