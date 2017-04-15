/* global utils */
const toSymbol = require('../../lib/transformations/svg-to-symbol');

const t = utils.setupPluginTest(toSymbol);

it('should change root node name to symbol', () => t(
  undefined,
  '<svg></svg>',
  '<symbol></symbol>'
));

it('should leave only tags from whitelist', () => t(
  { preserve: ['class'] },
  '<svg viewBox="0 0 0 0" id="qwe" class="qwe"></svg>',
  '<symbol class="qwe"></symbol>'
));

it('should set id if presented', () => t(
  { id: 'qwe' },
  '<svg></svg>',
  '<symbol id="qwe"></symbol>'
));
