const semver = require('semver');
const _webpack = require('webpack');

/**
 * @param {Object} [options]
 * @return {{extractor: Function, loaders: Array}}
 */
module.exports = ({
  webpack = _webpack,
  ExtractCssPlugin,
  MiniCssExtractPlugin
}) => {
  const options = { filename: '[name].css' };
  const supportMiniExtractPlugin = semver.satisfies(webpack.version, '>=4.4.0');

  const extractor = supportMiniExtractPlugin
    ? new MiniCssExtractPlugin(options)
    : new ExtractCssPlugin(options);

  const loaders = supportMiniExtractPlugin
    ? [MiniCssExtractPlugin.loader, 'css-loader']
    : extractor.extract({ use: ['css-loader'] });

  return { extractor, loaders };
};
