const fs = require('fs');

module.exports = {
  NAMESPACE: fs.realpathSync(__dirname),
  LOADER_PATH: require.resolve('./loader'),
  CSS_LOADER_PATH: require.resolve('./css-loader'),
  NO_SPRITE_FILENAME: '_'
};
