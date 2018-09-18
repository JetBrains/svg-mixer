const webpack = require('webpack');
const webpackVersion = require('webpack/package.json').version;
const semver = require('semver');
const { VM } = require('vm2');

const {
  createBaseConfig,
  MemoryCompiler
} = require('svg-mixer-test-utils/lib/webpack');

module.exports = class Utils {
  static async compile(config) {
    const compiler = Utils.createCompiler({ config });
    return await compiler.runAndGetAssets();
  }

  /**
   * @param {string} code
   * @return {Object}
   */
  static compileRuntime(code) {
    const vm = new VM();
    const proxy = vm.run(code);

    return [
      'id',
      'url',
      'width',
      'height',
      'viewBox',
      'toString',
      'backgroundSize',
      'backgroundPosition'
    ].reduce((acc, prop) => {
      acc[prop] = proxy[prop];
      return acc;
    }, {});
  }

  /**
   * @return {MemoryCompiler}
   */
  static createCompiler({ config, files, ...rest }) {
    return new MemoryCompiler({
      config,
      webpack,
      files,
      ...rest
    });
  }

  static createConfig(config) {
    if (webpackVersion.split('.')[0] >= '4') {
      config.mode = 'development';
    }
    return createBaseConfig(config);
  }

  /**
   * @param {Array} loaders
   * @return {{extractor: Function, use: Array}}
   */
  static createCssExtractor(loaders) {
    let ExtractCssPlugin;
    let MiniCssExtractPlugin;

    try {
      ExtractCssPlugin = require('extract-text-webpack-plugin');
      MiniCssExtractPlugin = require('mini-css-extract-plugin');
    } catch (e) {
      // Nothing here!
    }

    const options = { filename: '[name].css' };
    const supportMiniExtractPlugin = semver.satisfies(webpack.version, '>=4.4.0');

    const extractor = supportMiniExtractPlugin
      ? new MiniCssExtractPlugin(options)
      : new ExtractCssPlugin(options);

    const use = supportMiniExtractPlugin
      ? [MiniCssExtractPlugin.loader].concat(loaders)
      : extractor.extract({ use: loaders });

    return { extractor, use };
  }
};
