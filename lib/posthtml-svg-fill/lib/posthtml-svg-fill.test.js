/* global utils */
const plugin = require('./posthtml-svg-fill');

const t = utils.setupPluginTest(plugin);

const matcher = plugin.selectorToMatcher;

describe('selectorToMatcher()', () => {
  it('should support single tag selector', () => {
    expect(matcher('path')).to.eql([
      { tag: 'path' }
    ]);

    expect(matcher('circle,path')).to.eql([
      { tag: 'circle' },
      { tag: 'path' }
    ]);
  });

  it('should trim whitespaces in selectors', () => {
    expect(matcher('         circle,  path ')).to.eql([
      { tag: 'circle' },
      { tag: 'path' }
    ]);
  });

  it('should support #id selector', () => {
    expect(matcher('#circle')).to.eql([
      { attrs: { id: 'circle' } }
    ]);

    expect(matcher('path, #circle')).to.eql([
      { tag: 'path' },
      { attrs: { id: 'circle' } }
    ]);
  });

  it('should support #class selector', () => {
    expect(matcher('.circle')).to.eql([
      { attrs: { class: 'circle' } }
    ]);

    expect(matcher('path, .circle')).to.eql([
      { tag: 'path' },
      { attrs: { class: 'circle' } }
    ]);
  });
});

describe('plugin()', () => {
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
