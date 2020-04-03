const { resolve } = require('path');

const root = __dirname;

module.exports = {
  setupTestFrameworkScriptFile: resolve(root, './test/jest-setup.js'),
  testEnvironment: 'node',

  testMatch: [
    resolve(root, 'packages/*/test.js'),
    resolve(root, './packages/*/test/{*,**/*}?(\.)test.js')
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/packages/svg-mixer/runtime/'
  ]
};
