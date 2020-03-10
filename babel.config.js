module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        useBuiltIns: 'usage',
        polyfills: ['es.object.values', 'es.promise', 'es.symbol'],
      },
    ],
  ],
  sourceType: 'unambiguous',
};
