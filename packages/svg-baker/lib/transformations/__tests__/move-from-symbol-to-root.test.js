/* global utils */
const plugin = require('../move-from-symbol-to-root');

const t = utils.setupPluginTest(plugin);

it('should work', () => t(
  undefined,
  '<svg><symbol><defs><linearGradient></linearGradient></defs></symbol></svg>',
  '<svg><symbol><defs></defs></symbol><linearGradient></linearGradient></svg>'
));
