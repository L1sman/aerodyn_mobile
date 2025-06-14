module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['transform-remove-console']
      }
    },
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-export-namespace-from'
    ]
  };
}; 