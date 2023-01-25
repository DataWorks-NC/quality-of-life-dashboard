/**
 * Log messages to console when NODE_ENV = development only.
 *
 * @type {{data: (function(): {debug: boolean}), methods: {log: debugLogMixin.methods.log}}}
 */
export default {
  data: () => ({
    debug: import.meta.env.DEV,
  }),
  methods: {
    log(msg) {
      if (this.debug) {
        if (typeof msg === 'string') {
          // eslint-disable-next-line no-console
          console.log(`${this.$options.name} - ${msg}`);
        } else {
          // eslint-disable-next-line no-console
          console.log(msg);
        }
      }
    },
  },
};
