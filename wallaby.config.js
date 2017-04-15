/* eslint-disable import/no-extraneous-dependencies,global-require */
module.exports = () => {
  const config = {
    files: [
      { pattern: 'packages/*/lib/**/*.js' },

      // static
      { pattern: 'packages/*/package.json', load: false },
      { pattern: 'test/*.js', instrument: false }
    ],

    tests: [
      { pattern: 'packages/*/test/**/*.test.js' }
    ],

    testFramework: 'mocha',

    env: {
      type: 'node',
      runner: 'node'
    },

    // eslint-disable-next-line no-shadow
    setup: (wallaby) => {
      const mocha = wallaby.testFramework;
      require('./test/mocha-setup');

      // const { PACKAGE_NAME } = require('./lib/config');
      //
      // const OldInMemoryCompiler = webpackToolkit.InMemoryCompiler;
      // if (!OldInMemoryCompiler.patched) {
      //   // eslint-disable-next-line no-multi-assign
      //   const NewInMemoryCompiler = webpackToolkit.InMemoryCompiler = function patched(cfg) {
      //     cfg.resolve = {
      //       alias: {
      //         [PACKAGE_NAME]: `${wallaby.localProjectDir}`
      //       }
      //     };
      //
      //     cfg.resolveLoader = {
      //       modules: [`${wallaby.localProjectDir}/node_modules`]
      //     };
      //
      //     NewInMemoryCompiler.prototype = OldInMemoryCompiler.prototype;
      //     // eslint-disable-next-line prefer-rest-params
      //     return OldInMemoryCompiler.apply(this, arguments);
      //   };
      //   NewInMemoryCompiler.patched = true;
      // }
    }
  };

  return config;
};
