const { svgToSymbol } = require('svg-baker/lib/transformations');

const t = utils.testPlugin(svgToSymbol);

it('should work!', async () => {
  expect(await t(
    undefined,
    '<svg></svg>'
  )).toMatchSnapshot('change-root-node-name');

  expect(await t(
    undefined,
    '<?xml version="1.0" encoding="utf-8"?><!-- --><!DOCTYPE svg>\n<svg><path /></svg>'
  )).toMatchSnapshot('remove-doctype');

  expect(await t(
    { preserve: ['class'] },
    '<svg viewBox="0 0 0 0" id="qwe" class="qwe"></svg>'
  )).toMatchSnapshot('preserve-attributes');

  expect(await t(
    { id: 'qwe' },
    '<svg></svg>'
  )).toMatchSnapshot('set-id-if-not');
});

