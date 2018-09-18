const path = require('path');

const { EnvironmentManager } = require('svg-mixer-test-utils');

const manager = new EnvironmentManager({
  envsDir: path.resolve(__dirname, '../environments'),
  targetDir: path.resolve(__dirname, '..')
});

manager.install(process.argv[2]);
