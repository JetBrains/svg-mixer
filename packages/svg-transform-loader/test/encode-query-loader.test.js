const { createWebpackCompiler } = require('svg-mixer-test/utils');

it('should work!', async () => {
  const cfg = require('./encode-query-loader/webpack.config');
  const c = await createWebpackCompiler(cfg).run();
  const image = c.assets['twitter.svg'].source().toString();
  expect(image).toMatchSnapshot();
});
