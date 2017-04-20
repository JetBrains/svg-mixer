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
    setup: () => {
      require('./test/mocha-setup');
    }
  };

  return config;
};
