const { resolve } = require('path');

const postcss = require('postcss');

const plugin = require('.');

function exec(input, opts) {
  return postcss()
    .use(plugin(opts))
    .process(input, {
      from: resolve(utils.fixturesDir, 'test.css')
    })
    .then(({ css }) => css);
}

const defaultInput = '.a {background: url(twitter.svg)}';

it('should throw if file not found', async () => {
  await expect(exec('.a {background: url(qwe.svg)}')).rejects.toThrowError();
});

it('should work', async () => {
  expect(await exec(defaultInput))
    .toMatchSnapshot();
});

it('should allow to specify selector', async () => {
  expect(await exec(defaultInput, {
    selector: '::after'
  })).toMatchSnapshot();
});

it('should skip unmatched files', async () => {
  expect(await exec('.a {background: url(~@jetbrains/logos/appcode/appcode.svg)}', {
    match: [
      /\.svg$/,
      '!**/node_modules/**'
    ]
  })).toMatchSnapshot();
});
