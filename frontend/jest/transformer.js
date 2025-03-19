const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-flow'],
  plugins: ['@babel/plugin-transform-flow-strip-types'],
});
