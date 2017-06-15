const toSymbol = require('../../lib/transformations/svg-to-symbol');

const t = utils.setupPluginTest(toSymbol);

describe('svg-baker/transformations/svg-to-symbol', () => {
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

  it('should remove DOCTYPE', () => {
    // eslint-disable-next-line max-len
    const input = `<?xml version="1.0" encoding="utf-8"?><!-- --><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg><path /></svg>`;
    const expected = '<symbol><path /></symbol>';

    return t(
      undefined,
      input,
      expected
    );
  });
});
