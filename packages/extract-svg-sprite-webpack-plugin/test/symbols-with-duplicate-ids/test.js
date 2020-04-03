const webpack = require('webpack');
const memoryFs = require('memory-fs');

const { createCompiler } = require('svg-mixer-test').webpack;

it('symbols-with-duplicate-ids', async () => {
  const compiler = createCompiler(
    require('./webpack.config'),
    { webpack, memoryFs }
  );
  expect((await compiler.run()).warnings).toHaveLength(1);
});
