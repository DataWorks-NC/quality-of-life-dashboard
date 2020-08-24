/**
 * Log messages to console when NODE_ENV = development only.
 *
 * @type {{data: (function(): {debug: boolean}), methods: {log: debugLogMixin.methods.log}}}
 */
export default {
  data: () => ({
    debug: process.env.NODE_ENV === 'development',
  }),
  methods: {
    log(msg) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.log(`${this.$options.name} - ${msg}`);
      }
    },
  },
};
