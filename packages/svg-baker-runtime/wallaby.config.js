/* eslint-disable import/no-extraneous-dependencies,global-require */
const wallabyWebpack = require('wallaby-webpack');
const webpackConfig = require('./webpack.config.js');

webpackConfig.devtool = false;

module.exports = (wallaby) => {
  const config = {
    files: [
      { pattern: 'lib/**/*.js', load: false }
    ],

    tests: [
      { pattern: 'test/*.test.js', load: false }
    ],

    testFramework: 'mocha',

    env: {
      // runner: require('phantomjs-prebuilt').path
      kind: 'electron'
    },

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },

    postprocessor: wallabyWebpack(webpackConfig),

    reportConsoleErrorAsError: true,

    // eslint-disable-next-line no-shadow
    setup: () => {
      window.__moduleBundler.loadTests();
    }
  };

  return config;
};
