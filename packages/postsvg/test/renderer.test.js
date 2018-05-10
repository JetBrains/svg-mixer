const { testPostSvgPlugin } = require('svg-mixer-test/utils');

const t = testPostSvgPlugin();

const t2 = [
  '<g><path /></g>',
  '<path><animateTransform /></path>'
];

it('should work!', async () => {
  for (const val of t2) {
    expect(await t(undefined, val)).toMatchSnapshot();
  }
});
