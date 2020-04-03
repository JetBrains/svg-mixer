const webpack = require('webpack');
const memoryFs = require('memory-fs');
const { createCompiler, getAssets } = require('svg-mixer-test').webpack;

it('should works with extracted CSS', async () => {
  const compiler = createCompiler(
    require('./extract-css/webpack.config'),
    { webpack, memoryFs }
  );
  const compilation = await compiler.run();

  getAssets(compilation).forEach(({ name, content }) => {
    expect(content).toMatchSnapshot(name);
  });
});

it('should share sprite data with html-webpack-plugin', async () => {
  const compiler = createCompiler(
    require('./html-webpack-plugin-inline-sprite/webpack.config'),
    { webpack, memoryFs }
  );
  const compilation = await compiler.run();

  getAssets(compilation).forEach(({ name, content }) => {
    expect(content).toMatchSnapshot(name);
  });
});

it('should warn when symbols with duplicate ids exists', async () => {
  const compiler = createCompiler(
    require('./symbols-with-duplicate-ids/webpack.config'),
    { webpack, memoryFs }
  );

  expect((await compiler.run()).warnings).toHaveLength(1);
});
