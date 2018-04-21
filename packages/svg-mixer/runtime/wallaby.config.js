/* eslint-disable import/no-extraneous-dependencies,global-require */
const wallabyWebpack = require('wallaby-webpack');
const webpackConfig = require('./webpack.config.js');

module.exports = (wallaby) => {
  webpackConfig.devtool = false;
  webpackConfig.entryPatterns = ['mocha-setup.js', 'test/*.test.js'];

  const config = {
    files: [
      {
        pattern: 'src/**/*.js',
        load: false
      },
      {
        pattern: 'mocha-setup.js',
        instrument: false,
        load: false
      },
      {
        pattern: 'node_modules/chai/chai.js',
        instrument: false
      },
      {
        pattern: 'node_modules/sinon/pkg/sinon.js',
        instrument: false
      },
      {
        pattern: 'node_modules/sinon-chai/lib/sinon-chai.js',
        instrument: false
      },
      {
        pattern: 'node_modules/karma-chai-plugins/chai-adapter.js',
        instrument: false
      }
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
    setup: (wallaby) => {
      const mocha = wallaby.testFramework;
      mocha.fullTrace();

      window.expect = chai.expect;
      const should = chai.should();

      window.__moduleBundler.loadTests();
    }
  };

  return config;
};
