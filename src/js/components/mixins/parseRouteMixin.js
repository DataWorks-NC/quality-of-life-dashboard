import config from '@/js/modules/config.js';

export default {
  computed: {
    geography() {
      return config.siteConfig.geographies.find(
        (obj) => obj.id === this.$route.params.geographyLevel,
      ) || { id: null };
    },
    selectGroupName() {
      let selectGroupName = this.$route.params.selectGroupName;
      let selectGroupType = this.$route.params.selectGroupType;
      if (!selectGroupType && !selectGroupName ) {
        selectGroupType = this.$route.query.selectGroupType;
        selectGroupName = this.$route.query.selectGroupName;
      } else {
        selectGroupName = selectGroupName.replaceAll('_', ' ');
        selectGroupType = selectGroupType.replaceAll('_', ' ');
      }
      if (selectGroupType && selectGroupName && this.geography.id in config.selectGroups[selectGroupType] && selectGroupName in config.selectGroups[selectGroupType][this.geography.id]) return selectGroupName;
      return null;
    },
    selectGroupType() {
      let selectGroupType = this.$route.params.selectGroupType;
      if (!selectGroupType) {
        selectGroupType = this.$route.query.selectGroupType;
      } else {
        selectGroupType = selectGroupType.replaceAll('_', ' ');
      }
      if (selectGroupType && this.selectGroupName && this.geography.id in config.selectGroups[selectGroupType] && this.selectGroupName in config.selectGroups[selectGroupType][this.geography.id]) return selectGroupType;
      return null;
    },
    selected() {
      const selected = this.$route.query.selected;
      if (selected && selected.length) {
        if (!Array.isArray(selected)) {
          return [selected];
        }
        return selected;
      }
      if (this.selectGroupType && this.selectGroupName && this.geography.id in config.selectGroups[this.selectGroupType] && this.selectGroupName in config.selectGroups[this.selectGroupType][this.geography.id]) {
        return config.selectGroups[this.selectGroupType][this.geography.id][this.selectGroupName];
      }
      return [];
    },
    legendTitle() {
      if (!this.metric) {
        return null;
      }
      if (this.$route.query.legendTitle) {
        return this.$route.query.legendTitle;
      }
      if (this.metric.config) return `${this.$i18n.locale === 'es' ? this.metric.config.title_es : this.metric.config.title}, ${this.store.year}`;
      return '';
    },
  }
};
