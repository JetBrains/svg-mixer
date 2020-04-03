const path = require('path');
const { readFileSync } = require('fs');

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

module.exports.FIXTURES_DIR = FIXTURES_DIR;

module.exports.getFixture =
  filepath => readFileSync(path.resolve(FIXTURES_DIR, filepath)).toString();

module.exports.EnvironmentManager = require('./environment-manager');
module.exports.testPostSvgPlugin = require('./test-postsvg-plugin');
module.exports.webpack = require('./webpack-utils');
