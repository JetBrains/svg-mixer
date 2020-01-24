const postcss = require('postcss');
const postcssCustomProps = require('postcss-custom-properties');

const plugin = require('.');

function exec(input, opts) {
  return postcss()
    .use(plugin(opts))
    .process(input, { from: __filename })
    .then(({ css }) => css);
}

const cases = [
  {
    name: 'should not move non prefixed props by default',
    input: '.a {background: url(1.png); fill: red}',
    expected: '.a {background: url(1.png); fill: red}'
  },
  {
    name: 'should move only -svg-* props by default',
    input: '.a {background: url(1.png); -svg-mixer-fill: red}',
    expected: '.a {background: url(1.png?fill=red)}'
  },
  {
    name: 'should encode param value',
    input: '.a {background: url(1.png); -svg-mixer-fill: #fff;}',
    expected: '.a {background: url(1.png?fill=%23fff);}'
  },
  {
    name: 'should encode functions properly',
    input: '.a {background: url(1.png); -svg-mixer-fill: rgba(255, 0, 0, 0.5);}',
    expected: `.a {background: url(1.png?fill=rgba%28255%2C%200%2C%200%2C%200.5%29);}`
  },
  {
    name: 'should preserve if any query params already there',
    input: '.a {background: url(1.png?qwe); -svg-mixer-fill: red}',
    expected: '.a {background: url(1.png?qwe&fill=red)}'
  },
  {
    name: 'should allow to override default props',
    input: '.a {background: url(1.png); -svg-mixer-fill: red; color: blue}',
    expected: '.a {background: url(1.png?color=blue); -svg-mixer-fill: red}',
    options: { match: ['color'] }
  },
  {
    name: 'should allow to use custom transformer',
    input: '.a {background: url(1.png); -svg-mixer-fill: red;}',
    expected: '.a {background: url(1.png?-SVG-MIXER-FILL=red);}',
    options: {
      transform: ({ name, value }) => ({ name: name.toUpperCase(), value })
    }
  },
  {
    name: 'should compute custom properties',
    input: ':root {--color: red} .a {background: url(1.png); -svg-mixer-fill: var(--color)}',
    expected: ':root {--color: red} .a {background: url(1.png?fill=red)}',
    options: {
      computeCustomProps: postcssCustomProps({
        preserve: false
      })
    }
  }
];

cases.forEach(({ name, input, options, expected }) => {
  it(name, async () => {
    expect(await exec(input, options)).toEqual(expected);
  });
});
