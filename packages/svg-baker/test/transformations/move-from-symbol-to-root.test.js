const plugin = require('../../lib/transformations/move-from-symbol-to-root');

const t = utils.setupPluginTest(plugin);

describe('svg-baker/transformations/move-from-symbol-to-root', () => {
  it('should work', () => t(
    undefined,
    '<svg><symbol><defs><linearGradient></linearGradient><mask></mask><clipPath></clipPath></defs></symbol></svg>',
    '<svg><symbol><defs></defs></symbol><linearGradient></linearGradient><mask></mask><clipPath></clipPath></svg>'
  ));
});
