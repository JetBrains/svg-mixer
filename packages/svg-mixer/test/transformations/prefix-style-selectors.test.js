const { prefixStyleSelectors } = require('svg-mixer/lib/transformations');

const { testPostSvgPlugin } = require('svg-mixer-test');

const t = testPostSvgPlugin(prefixStyleSelectors);

it('should prefix all <style> tag selectors', async () => {
  expect(await t(
    '.qwe',
    '<svg><defs><style>.a {} .b .c {}</style></defs></svg>',
  )).toMatchSnapshot();
});
