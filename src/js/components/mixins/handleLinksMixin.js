export default {
  mounted() {
    this.handleLinks();
  },
  updated() {
    this.handleLinks();
  },
  methods: {
    handleLinks() {
      const links = this.$el.getElementsByTagName("a");
      for (let i = 0; i < links.length; i += 1) {
        if (!links[i].querySelector(".link-underline")) {
          links[i].innerHTML = `<span class="link-underline">${links[i].innerHTML}</span>`;
        }
      }
    },
  }
};
