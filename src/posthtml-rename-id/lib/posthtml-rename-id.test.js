const plugin = require('./posthtml-rename-id');
const t = require('../../../utils').setupPluginTest(plugin);

const defaultPattern = 'test_[id]';

describe('Pattern', () => {
  t(
    'default (does nothing)',
    undefined,
    '<svg><path id="a" /></svg>',
    '<svg><path id="a" /></svg>'
  );

  t(
    'string',
    'b',
    '<svg><path id="a" /></svg>',
    '<svg><path id="b" /></svg>'
  );

  t(
    '[id] placeholder',
    'test_[id]',
    '<svg><path id="a" /></svg>',
    '<svg><path id="test_a" /></svg>'
  );

  t(
    'function',
    id => id.toUpperCase(),
    '<svg><path id="aaa" /></svg>',
    '<svg><path id="AAA" /></svg>'
  );

  t(
    'function with placeholder in returned value',
    () => 'qwe_[id]_[id]',
    '<svg><path id="aaa" /></svg>',
    '<svg><path id="qwe_aaa_aaa" /></svg>'
  );
});

describe('Processing', () => {
  t(
    'should not modify nodes without id',
    defaultPattern,
    '<svg><path /></svg>',
    '<svg><path /></svg>'
  );

  t(
    'should modify any attribute value which contains `url(#id)`',
    defaultPattern,
    '<svg><linearGradient id="gradient"><stop stop-color="red" /></linearGradient><path fill="url(#gradient)" /></svg>',
    '<svg><linearGradient id="test_gradient"><stop stop-color="red" /></linearGradient><path fill="url(#test_gradient)" /></svg>'
  );

  t(
    'should not modify attribute value which contains `url(#id)` when correspondent id not found',
    defaultPattern,
    '<svg><linearGradient><stop stop-color="red" /></linearGradient><path fill="url(#gradient)" /></svg>',
    '<svg><linearGradient><stop stop-color="red" /></linearGradient><path fill="url(#gradient)" /></svg>'
  );

  t(
    'should modify `link/xlink:href` attribute',
    defaultPattern,
    '<svg><path id="path" /><use xlink:href="#path" href="#path" /></svg>',
    '<svg><path id="test_path" /><use xlink:href="#test_path" href="#test_path" /></svg>'
  );

  t(
    'should not modify `link/xlink:href` attribute when correspondent id not found',
    defaultPattern,
    '<svg><path /><use xlink:href="#path" href="#path" /></svg>',
    '<svg><path /><use xlink:href="#path" href="#path" /></svg>'
  );

  t(
    'should modify style declarations',
    defaultPattern,
    '<svg><path id="ref" /><path style="fill: url(#ref); background-image: url(#ref) ; " /></svg>',
    '<svg><path id="test_ref" /><path style="fill: url(#test_ref); background-image: url(#test_ref) ; " /></svg>'
  );

  t(
    'should not modify style declarations when correspondent id not found',
    defaultPattern,
    '<svg><path /><path style="fill: url(#ref); background-image: url(#ref) ; " /></svg>',
    '<svg><path /><path style="fill: url(#ref); background-image: url(#ref) ; " /></svg>'
  );

  t(
    'should modify style declarations in `style` tag',
    defaultPattern,
    '<svg><defs><style>.a {fill: url(#ref);}</style></defs><path id="ref" /><path fill="url(#ref)" /></svg>',
    '<svg><defs><style>.a {fill: url(#test_ref);}</style></defs><path id="test_ref" /><path fill="url(#test_ref)" /></svg>'
  );

  t(
    'should not modify style declarations in `style` tag when correspondent id not found',
    defaultPattern,
    '<svg><defs><style>.a {fill: url(#ref);}</style></defs><path /><path fill="url(#ref)" /></svg>',
    '<svg><defs><style>.a {fill: url(#ref);}</style></defs><path /><path fill="url(#ref)" /></svg>'
  );
});
