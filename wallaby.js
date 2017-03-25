module.exports = (wallaby) => {
  return {
    files: [
      { pattern: 'src/**/*.js' },
      { pattern: 'src/**/*.test.js', ignore: true }
    ],

    tests: [
      { pattern: 'src/**/*.test.js' }
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest',

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    }
  };
};
