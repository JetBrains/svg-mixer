const { deepStrictEqual } = require('assert');
const plugin = require('../');

const t = utils.setupPluginTest(plugin);

const matcher = plugin.selectorToMatcher;

describe('posthtml-svg-fill', () => {
  describe('selectorToMatcher()', () => {
    it('should support single tag selector', () => {
      deepStrictEqual(matcher('path'), [
        { tag: 'path' }
      ]);

      deepStrictEqual(matcher('circle,path'), [
        { tag: 'circle' },
        { tag: 'path' }
      ]);
    });

    it('should trim whitespaces in selectors', () => {
      deepStrictEqual(matcher('         circle,  path '), [
        { tag: 'circle' },
        { tag: 'path' }
      ]);
    });

    it('should support #id selector', () => {
      deepStrictEqual(matcher('#circle'), [
        { attrs: { id: 'circle' } }
      ]);

      deepStrictEqual(matcher('path, #circle'), [
        { tag: 'path' },
        { attrs: { id: 'circle' } }
      ]);
    });

    it('should support #class selector', () => {
      deepStrictEqual(matcher('.circle'), [
        { attrs: { class: 'circle' } }
      ]);

      deepStrictEqual(matcher('path, .circle'), [
        { tag: 'path' },
        { attrs: { class: 'circle' } }
      ]);
    });
  });

  it('should do nothing if fill option not provided', () => t(
    null,
    '<path />',
    '<path />'
  ));

  it('should process single tag', () => t(
    { fill: '#f00', selector: 'path' },
    '<path /><circle />',
    '<path fill="#f00" /><circle />'
  ));

  it('should process multiple tags', () => t(
    { fill: 'red', selector: 'path, circle' },
    '<path /><circle />',
    '<path fill="red" /><circle fill="red" />'
  ));

  it('should process #id selectors', () => t(
    { fill: 'red', selector: '#id' },
    '<path id="id" /><circle />',
    '<path id="id" fill="red" /><circle />'
  ));

  it('should process .class selectors', () => t(
    { fill: 'red', selector: '.class' },
    '<path class="class" /><circle />',
    '<path class="class" fill="red" /><circle />'
  ));

  it('should overwrite fill attribute', () => t(
    { fill: 'blue' },
    '<path fill="red" />',
    '<path fill="blue" />'
  ));
});
