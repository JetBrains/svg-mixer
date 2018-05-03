const { moveNodesOutsideSymbol } = require('svg-mixer/lib/transformations');

const { testPostSvgPlugin } = require('../../../../test/utils');

const t = testPostSvgPlugin(moveNodesOutsideSymbol);

it('Move all gradients, patterns and filters outside symbol', async () => {
  expect(await t(
    undefined,
    '<svg><symbol><defs><linearGradient></linearGradient></defs></symbol></svg>',
  )).toMatchSnapshot();
});
