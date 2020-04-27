const { createCompiler } = require('svg-mixer-test').webpack;

it('should work!', async () => {
  const cfg = require('./encode-query-loader/webpack.config');
  const c = await createCompiler(cfg).run();
  const image = c.assets['twitter.svg'];
  expect(image).toMatchSnapshot();
});
