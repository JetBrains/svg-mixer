const semver = require('semver');

module.exports = webpack => {
  const { version } = webpack;
  return {
    get miniCssExtractPlugin() {
      return semver.satisfies(version, '>=4.4.0');
    }
  };
};
