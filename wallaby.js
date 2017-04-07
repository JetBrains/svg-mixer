module.exports = (wallaby) => {
  return {
    files: [
      { pattern: 'packages/**/*.js' },
      { pattern: 'packages/**/*.test.js', ignore: true }
    ],

    tests: [
      { pattern: 'packages/**/*.test.js' }
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
