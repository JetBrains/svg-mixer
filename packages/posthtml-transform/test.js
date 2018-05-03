/* eslint-disable no-shadow */
const { parse } = require('postsvg');

const { getFixture, testPostSvgPlugin } = require('../../test/utils');

const plugin = require('.');

const t = testPostSvgPlugin(plugin);
const image = getFixture('twitter.svg');

describe('plugin', () => {
  it('config: String', async () => {
    expect(await t('?fill=red path&stroke=black%20path', image)).toMatchSnapshot();
  });

  it('config: Object', async () => {
    const params = { attr: 'fill', value: 'red' };
    expect(await t(params, image)).toMatchSnapshot();
  });

  it('config: Array<Object|Function>', async () => {
    const params = [{ attr: 'fill', value: 'red' }];
    expect(await t(params, image)).toMatchSnapshot();
  });

  it('config: Function', async () => {
    const tree = parse(image);
    const transformer = jest.fn(node => node.attrs.fill = 'red');
    const res = await t(transformer, tree, { skipParse: true });

    expect(transformer).toHaveBeenCalledTimes(2);
    expect(res).toMatchSnapshot();
  });

  it('config: Array<Function>', async () => {
    const params = node => node.tag === 'svg' && (node.attrs.foo = 'bar');
    expect(await t(params, image)).toMatchSnapshot();
  });

  it('config: throws if not String|Object|Array<Object|Function>|Function', async () => {
    await expect(t(undefined, image)).rejects.toThrowError();
    await expect(t(null, image)).rejects.toThrowError();
    await expect(t(1, image)).rejects.toThrowError();
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
