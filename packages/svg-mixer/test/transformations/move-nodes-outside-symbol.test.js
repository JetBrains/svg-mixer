const { moveNodesOutsideSymbol } = require('svg-mixer/lib/transformations');

const { testPostSvgPlugin } = require('svg-mixer-test/utils');

const t = testPostSvgPlugin(moveNodesOutsideSymbol);

it('Move all gradients, patterns and filters outside symbol', async () => {
  expect(await t(
    undefined,
    '<svg><symbol><defs><linearGradient></linearGradient></defs></symbol></svg>',
  )).toMatchSnapshot();
});
