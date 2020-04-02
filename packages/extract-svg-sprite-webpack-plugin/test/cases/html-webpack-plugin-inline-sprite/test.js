const webpack = require('webpack');
const memoryFs = require('memory-fs');

const { createCompiler, getAssets } = require('svg-mixer-test').webpack;

it('extract css', async () => {
  const compiler = createCompiler(
    require('./webpack.config'),
    { webpack, memoryFs }
  );
  const compilation = await compiler.run();

  getAssets(compilation).forEach(({ name, content }) => {
    expect(content).toMatchSnapshot(name);
  })
});

