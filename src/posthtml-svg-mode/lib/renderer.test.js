const t = require('../../../utils/index').setupPluginTest();

t(
  'should properly render self-closing tags',
  null,
  '<path />',
  '<path />'
);

t(
  'should detect if self-closing element used as blocked element',
  null,
  '<path><animateTransform /></path>',
  '<path><animateTransform /></path>'
);
