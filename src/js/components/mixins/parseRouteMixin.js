import config from '@/js/modules/config.js';

export default {
  computed: {
    geography() {
      return config.siteConfig.geographies.find(
        (obj) => obj.id === this.$route.params.geographyLevel,
      ) || { id: null };
    },
    selectGroupName() {
      const { selectGroupType = null, selectGroupName = null } = this.$route.query;
      if (selectGroupType && selectGroupName && this.geography.id in config.selectGroups[selectGroupType] && selectGroupName in config.selectGroups[selectGroupType][this.geography.id]) return selectGroupName;
      return null;
    },
    selectGroupType() {
      const { selectGroupType = null, selectGroupName = null } = this.$route.query;
      if (selectGroupType && selectGroupName && this.geography.id in config.selectGroups[selectGroupType] && selectGroupName in config.selectGroups[selectGroupType][this.geography.id]) return selectGroupType;
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
  }
};
