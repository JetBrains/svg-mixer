const webpack = require('webpack');
const webpackVersion = require('webpack/package.json').version;
const mergeConfigs = require('webpack-merge');
const semver = require('semver');
const { VM } = require('vm2');

const {
  createBaseConfig,
  MemoryCompiler
} = require('svg-mixer-test-utils/lib/webpack');

module.exports = class Utils {
  /**
   *
   * @param {Object} options
   * @param {Object} options.config
   * @param {Object} options.files
   * @return {Promise<*>}
   */
  static async compile(options) {
    const compiler = Utils.createCompiler(options);
    return await compiler.runAndGetAssets();
  }

  /**
   * @param {string} code
   * @param {Object} [vmOptions] {@see https://github.com/patriksimek/vm2#nodevm}
   * @return {Object}
   */
  static exec(code, vmOptions) {
    const vm = new VM(vmOptions);
    return vm.run(code);
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
