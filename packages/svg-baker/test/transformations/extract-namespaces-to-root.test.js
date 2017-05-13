const plugin = require('../../lib/transformations/extract-namespaces-to-root');

const t = utils.setupPluginTest(plugin);

describe('svg-baker/transformations/extract-namespaces-to-root', () => {
  it('should work', () => t(
    undefined,
    '<svg><g xmlns:shalala="tralala"><path d="" xmlns="qwe" xmlns:qwe="qwe2" /></g></svg>',
    '<svg xmlns:shalala="tralala" xmlns="qwe" xmlns:qwe="qwe2"><g><path d="" /></g></svg>'
  ));
});
