const { runScript, compile } = require('./utils');

it('should generate proper runtime', async () => {
  let cfg = require('./runtime/webpack.config');
  let assets = await compile(cfg);
  let svgModule = runScript(assets['main.js']).default;

  expect(svgModule).toMatchSnapshot('main.js');
  expect(assets['sprite.svg']).toMatchSnapshot('sprite.svg');

  // with require.context
  cfg = Object.assign({ entry: './require-context' }, cfg);
  assets = await compile(cfg);
  svgModule = runScript(assets['main.js']).default;

  expect(svgModule).toMatchSnapshot('main.js with require.context');
});

it('should works with extracted CSS', async () => {
  const assets = await compile(require('./extract-css/webpack.config'));
  expect(assets['main.css']).toMatchSnapshot('main.css');
  expect(assets['sprite.svg']).toMatchSnapshot('sprite.svg');
});

it('should share sprite data with html-webpack-plugin', async () => {
  const assets = await compile(
    require('./html-webpack-plugin-inline-sprite/webpack.config')
  );
  expect(assets['index.html']).toMatchSnapshot('index.html');
});

it('should warn when symbols with duplicate ids exists', async () => {
  const { warnings } = await compile(
    require('./symbols-with-duplicate-ids/webpack.config'),
    false
  );
  expect(warnings).toHaveLength(1);
});
