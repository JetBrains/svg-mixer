const { moveNodesOutsideSymbol } = require('svg-baker/lib/transformations');

const t = utils.testPlugin(moveNodesOutsideSymbol);

it('Move all gradients, patterns and filters outside symbol', async () => {
  expect(await t(
    undefined,
    '<svg><symbol><defs><linearGradient></linearGradient></defs></symbol></svg>',
  )).toMatchSnapshot();
});
