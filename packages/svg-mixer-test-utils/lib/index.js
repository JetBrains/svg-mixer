const path = require('path');
const { readFileSync } = require('fs');

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

module.exports = {
  FIXTURES_DIR,
  getFixture: filepath => readFileSync(path.resolve(FIXTURES_DIR, filepath)).toString(),
  EnvironmentManager: require('./environment-manager'),
  testPostSvgPlugin: require('./test-postsvg-plugin'),
  webpack: require('./webpack')
};
