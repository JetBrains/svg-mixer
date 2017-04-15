/* global utils */
const t = utils.setupPluginTest();

describe('posthtml-svg-mode/renderer', () => {
  it('should properly render self-closing tags', () => t(
    null,
    '<g><path /></g>',
    '<g><path /></g>'
  ));

  it('should detect if self-closing element used as block element', () => t(
    null,
    '<path><animateTransform /></path>',
    '<path><animateTransform /></path>'
  ));
});
