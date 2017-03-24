/* global utils */
const t = utils.setupPluginTest();

it('should properly render self-closing tags', () => t(
  null,
  '<path />',
  '<path />'
));

it('should detect if self-closing element used as block element', () => t(
  null,
  '<path><animateTransform /></path>',
  '<path><animateTransform /></path>'
));

