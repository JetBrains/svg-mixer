const plugin = require('../../lib/transformations/normalize-viewbox');

const t = utils.setupPluginTest(plugin);

describe('svg-baker/transformations/normalize-viewbox', () => {
  it('should do nothing if viewBox presented', () => {
    return t(
      undefined,
      '<svg viewBox="0 0 0 0"></svg>',
      '<svg viewBox="0 0 0 0"></svg>'
    );
  });

  it('should create viewBox if not presented', () => {
    return t(
      undefined,
      '<svg width="0" height="0"></svg>',
      '<svg width="0" height="0" viewBox="0 0 0 0"></svg>'
    );
  });

  it('should not remove widht/height by default', () => {
    return t(
      undefined,
      '<svg viewBox="0 0 0 0" width="0" height="0"></svg>',
      '<svg viewBox="0 0 0 0" width="0" height="0"></svg>'
    );
  });

  it('should remove width/height if removeDimensions is true', () => {
    return t(
      { removeDimensions: true },
      '<svg width="0" height="0"></svg>',
      '<svg viewBox="0 0 0 0"></svg>'
    );
  });
});
