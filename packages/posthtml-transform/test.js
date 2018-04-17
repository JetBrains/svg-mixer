/* eslint-disable no-shadow */
const plugin = require('.');

const t = utils.testPlugin(plugin);
const image = utils.getFixture('twitter.svg');

describe('plugin', () => {
  it('config: Object', async () => {
    const params = { attr: 'fill', value: 'red' };
    expect(await t(params, image)).toMatchSnapshot();
  });

  it('config: Array<Object|Function>', async () => {
    const params = [{ attr: 'fill', value: 'red' }];
    expect(await t(params, image)).toMatchSnapshot();
  });

  it('config: Function', async () => {
    const tree = utils.parse(image);
    const transformer = jest.fn(node => node.attrs.fill = 'red');
    const res = await t(transformer, tree, { skipParse: true });

    expect(transformer).toHaveBeenCalledTimes(2);
    expect(res).toMatchSnapshot();
  });

  it('config: Array<Function>', async () => {
    const params = node => node.tag === 'svg' && (node.attrs.foo = 'bar');
    expect(await t(params(), image)).toMatchSnapshot();
  });

  it('config: throws if not Object|Array<Object|Function>|function', async () => {
    await expect(t('invalid config', image)).rejects.toThrowError();
  });

  it('should process only selector nodes', async () => {
    const params = { attr: 'fill', value: 'red', selector: 'path' };
    expect(await t(params, image)).toMatchSnapshot();
  });

  it('should rename tag', async () => {
    const params = { selector: 'svg', tag: 'symbol' };
    expect(await t(params, image)).toMatchSnapshot();
  });
});

describe('getTransformerParams', () => {
  it.only('should work!', () => {
    getTransformerParams(`qwe=${encodeURIComponent('#fff path')}`);
  });
});
