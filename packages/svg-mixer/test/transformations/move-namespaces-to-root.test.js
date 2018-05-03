const { moveNamespacesToRoot } = require('svg-mixer/lib/transformations');

const { testPostSvgPlugin } = require('../../../../test/utils');

const t = testPostSvgPlugin(moveNamespacesToRoot);

it('should move all namespaces to root node', async () => {
  expect(await t(
    undefined,
    '<svg><g xmlns:shalala="tralala"><path d="" xmlns="qwe" xmlns:qwe="qwe2" /></g></svg>'
  )).toMatchSnapshot();
});
