const postcss = require('postcss');

const encodeQuery = require('../lib/postcss-encode-query-string-params');

async function exec(input, expected) {
  const { css } = await postcss()
    .use(encodeQuery())
    .process(input, { from: __filename });
  expect(css).toEqual(expected);
}

it('should encode', async () => {
  await exec(
    '.a {background: url(./image.svg?param=#qwe&param2=qwe);}',
    '.a {background: url(./image.svg?param=%23qwe&param2=qwe);}'
  );

  await exec(
    '.a {background: url("./image.svg?param=#qwe #fff");}',
    '.a {background: url("./image.svg?param=%23qwe%20%23fff");}'
  );
});

it('should encode only query param values', async () => {
  await exec(
    '.a {background: url(./image.svg#lalala);}',
    '.a {background: url(./image.svg#lalala);}'
  );
});

/**
 * TODO
 * This case should return modified value because urijs normalize URLs like 'font.eot?#iefix'
 * @see https://github.com/iAdramelk/postcss-helpers/blob/master/lib/url.js#L70
 * @see https://github.com/iAdramelk/postcss-helpers/blob/master/test/test.js#L37
 */

it('should modify fragment part with empty query (TODO)', async () => {
  await exec(
    '.a {background: url(./image.svg?#lalala);}',
    '.a {background: url(./image.svg#lalala);}'
  );
});

it('should not modify fragment with query param without value', async () => {
  await exec(
    '.a {background: url(./image.svg?q#lalala);}',
    '.a {background: url(./image.svg?q#lalala);}'
  );
});

it('should encode fragment with empty query param value', async () => {
  await exec(
    '.a {background: url(./image.svg?q=#lalala);}',
    '.a {background: url(./image.svg?q=%23lalala);}'
  );
});

it('should encode sharp in each param', async () => {
  await exec(
    '.a {background: url(image.svg?fill=#f0f,#qwe&stroke=#000&tralala=#00ffdd#qwe)}',
    '.a {background: url(image.svg?fill=%23f0f%2C%23qwe&stroke=%23000&tralala=%2300ffdd%23qwe)}'
  );
});
