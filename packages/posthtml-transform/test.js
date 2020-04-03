/* eslint-disable no-shadow */
const postsvg = require('postsvg');
const pretty = require('pretty');
const { getFixture } = require('svg-mixer-test');

const plugin = require('.');

async function t(rules, input, cfg) {
  const { svg } = await postsvg().use(plugin(rules, cfg)).process(input);
  return pretty(svg);
}

const image = getFixture('twitter.svg');

describe('plugin', () => {
  describe('config', () => {
    it('config: string', async () => {
      expect(await t('?fill=red path&stroke=black%20path', image)).toMatchSnapshot();
    });

    it('config: Array<Object>', async () => {
      const params = [{ attr: 'fill', value: 'red' }];
      expect(await t(params, image)).toMatchSnapshot();
    });

    it('config: throws if not Array<Object>|string', async () => {
      await expect(t(undefined, image)).rejects.toThrowError();
      await expect(t(null, image)).rejects.toThrowError();
      await expect(t(1, image)).rejects.toThrowError();
    });
  });

  it('should process only selector nodes', async () => {
    const rules = [{ attr: 'fill', value: 'red', selector: 'path' }];
    expect(await t(rules, image)).toMatchSnapshot();
  });

  it('should rename tag', async () => {
    const rules = [{ selector: 'svg', tag: 'symbol' }];
    const res = await t(rules, image, { skipRootTag: false });
    expect(res).toMatchSnapshot();
  });

  it('should allow to use multiple value in 1 rule', async () => {
    const rules = [{ attr: 'fill', value: 'red path, green svg' }];
    const res = await t(rules, image, { skipRootTag: false });
    expect(res).toMatchSnapshot();
  });

  it('should allow to use rule value with quotes', async () => {
    const rules = [{ attr: 'fill', value: '"red"', selector: '"path"' }];
    const res = await t(rules, image);
    expect(res).toMatchSnapshot();
  });

  it('should convert alpha colors', async () => {
    const rules = [{ attr: 'fill', value: 'rgba(255, 255, 255, 0.5)' }];
    const res = await t(rules, image);
    expect(res).toMatchSnapshot();
  });
});
