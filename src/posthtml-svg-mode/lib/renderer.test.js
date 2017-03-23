const t = require('../../../utils/index').setupPluginTest();

it('should properly render self-closing tags', () => {
  t(
    null,
    '<path />',
    '<path />'
  );
});

it('should detect if self-closing element used as blocked element', () => {
  t(
    null,
    '<path><animateTransform /></path>',
    '<path><animateTransform /></path>'
  );
});

