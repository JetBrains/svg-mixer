const postcss = require('postcss');

const plugin = require('.');

function exec(input, opts) {
  return postcss()
    .use(plugin(opts))
    .process(input)
    .then(({ css }) => css);
}

it('should move svg-* props by default', async () => {
  expect(await exec(
    '.a {background: url(1.png); fill: red}'
  )).toMatchSnapshot();

  expect(await exec(
    '.a {background: url(1.png); svg-fill: red}'
  )).toMatchSnapshot();
});

it('should preserve if any query params already there', async () => {
  expect(await exec(
    '.a {background: url(1.png?qwe); svg-fill: red}'
  )).toMatchSnapshot();
});

it('should allow to override default props', async () => {
  expect(await exec(
    '.a {background: url(1.png); svg-fill: red; color: blue}',
    { props: ['color'] }
  )).toMatchSnapshot();
});

it('should allow to not remove props after moving them to query', async () => {
  expect(await exec(
    '.a {background: url(1.png); svg-fill: red;}',
    { remove: false }
  )).toMatchSnapshot();
});

it('should allow to use custom transformer', async () => {
  expect(await exec(
    '.a {background: url(1.png); svg-fill: red;}',
    { transform: ({ prop: name, value }) => ({ name: name.toUpperCase(), value }) }
  )).toMatchSnapshot();
});

it('should always encode prop value even with custom transformer', async () => {
  expect(await exec(
    '.a {background: url(1.png); svg-fill: #fff;}'
  )).toMatchSnapshot();

  expect(await exec(
    '.a {background: url(1.png); svg-fill: #fff;}',
    { transform: ({ prop: name, value }) => ({ name: name.toUpperCase(), value }) }
  )).toMatchSnapshot();
});

it('should allow to use include/exclude options', async () => {
  expect(await exec(
    '.a {background: url(1.svg); svg-fill: red;}',
    { include: '*.png' }
  )).toMatchSnapshot();

  expect(await exec(
    '.a {background: url(300.svg); svg-fill: red;}',
    { include: '*.svg', exclude: '300.*' }
  )).toMatchSnapshot();

  expect(await exec(
    '.a {background: url(1.bmp); svg-fill: red;}',
    { include: ['*.png', '*.svg'] }
  )).toMatchSnapshot();

  expect(await exec(
    '.a {background: url(1.svg); svg-fill: red;}',
    { include: ['*.png', '*.svg'] }
  )).toMatchSnapshot();
});

