const path = require('path');

const { sync: glob } = require('glob');

const { createWebpackCompiler } = require('svg-mixer-test/utils');

glob(`${path.resolve(__dirname, 'cases')}/*/webpack.config.js`)
  .forEach(cfgPath => {
    const caseDir = path.dirname(cfgPath);
    const caseName = path.basename(caseDir);
    const cfg = require(cfgPath);

    it(`case: ${caseName}`, async () => {
      const { assets: rawAssets } = await createWebpackCompiler(cfg).run();
      const assets = {};

      Object.keys(rawAssets).forEach(name => {
        assets[name] = rawAssets[name].source().toString();
      });

      Object.keys(assets).forEach(name => {
        expect(assets[name]).toMatchSnapshot();
      });
    });
  });
