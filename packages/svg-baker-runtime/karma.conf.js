const webpackConfig = require('./webpack.config.js');

module.exports = (config) => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'sinon-chai'],

    // list of files / patterns to load in the browser
    files: [
      'test/*.test.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/*.test.js': ['webpack', 'sourcemap']
    },

    browsers: ['Chrome'],

    // Webpack config
    webpack: webpackConfig,
    webpackServer: {
      stats: {
        colors: true
      },
      noInfo: true,
      quiet: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    mochaReporter: {
      showDiff: true
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    captureTimeout: 5000,

    browserDisconnectTimeout: 5000,

    // Increase timeout because of webpack
    // See https://github.com/karma-runner/karma/issues/598
    browserNoActivityTimeout: 90000,

    // cli runner port
    runnerPort: 9100
  });
};
