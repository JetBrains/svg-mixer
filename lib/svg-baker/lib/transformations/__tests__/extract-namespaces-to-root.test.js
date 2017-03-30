const plugin = require('../extract-namespaces-to-root');

const t = utils.setupPluginTest(plugin);

it('should work', () => t(
  undefined,
  '<svg><path d="" xmlns="qwe" xmlns:qwe="qwe2" /></svg>',
  '<svg xmlns="qwe" xmlns:qwe="qwe2"><path d="" /></svg>'
));
