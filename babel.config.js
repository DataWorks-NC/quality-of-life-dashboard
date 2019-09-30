module.exports = {
  presets: [
    [
      '@vue/app',
      {
        useBuiltIns: 'usage',
        polyfills: ['es7.object.values', 'es6.promise', 'es6.symbol'],
      },
    ],
  ],
  sourceType: 'unambiguous',
};
