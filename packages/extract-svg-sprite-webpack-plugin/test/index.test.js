const path = require('path');

const { sync: glob } = require('glob');

const { createWebpackCompiler } = require('../../../test/utils');

glob(`${path.resolve(__dirname, 'cases')}/*/webpack.config.js`)
  .forEach(cfgPath => {
    const caseDir = path.dirname(cfgPath);
    const caseName = path.basename(caseDir);
    const cfg = require(cfgPath);

    it(`case: ${caseName}`, async () => {
      const { assets } = await createWebpackCompiler(cfg).run();

      Object.keys(assets).forEach(name => {
        const content = assets[name].source().toString();
        expect(content).toMatchSnapshot();
      });
    });
  });
