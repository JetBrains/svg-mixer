const plugin = require('../../lib/transformations/prefix-style-selectors');

const t = utils.setupPluginTest(plugin);

describe('svg-baker/transformations/prefix-style-selectors', () => {
  it('should work', () => t(
    '.qwe',
    '<svg><defs><style>.a {} .b .c {}</style></defs></svg>',
    '<svg><defs><style>.qwe .a {} .qwe .b .c {}</style></defs></svg>'
  ));
});
