const path = require('path');

const webpack = require('webpack');
const memoryFs = require('memory-fs');
const { sync: glob } = require('glob');

const { createWebpackCompiler } = require('svg-mixer-test/utils');

glob(`${path.resolve(__dirname, 'cases')}/*/webpack.config.js`)
  .forEach(cfgPath => {
    const caseDir = path.dirname(cfgPath);
    const caseName = path.basename(caseDir);
    const cfg = require(cfgPath);
    cfg.context = caseDir;

    it(`case: ${caseName}`, async () => {
      const compiler = createWebpackCompiler(cfg, {
        webpack,
        memoryFs
      });
      const { assets: rawAssets } = await compiler.run();
      const assets = {};

      Object.keys(rawAssets).forEach(name => {
        assets[name] = rawAssets[name].source().toString().trim();
      });

      Object.keys(assets).forEach(name => {
        expect(assets[name]).toMatchSnapshot(name);
      });
    });
  });
