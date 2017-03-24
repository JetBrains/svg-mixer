/* global utils */
const t = utils.setupPluginTest();

it('should properly render self-closing tags', () => {
  return t(
    null,
    '<path />',
    '<path />'
  );
});

it('should detect if self-closing element used as block element', () => {
  return t(
    null,
    '<path><animateTransform /></path>',
    '<path><animateTransform /></path>'
  );
});

