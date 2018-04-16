/* eslint-disable no-shadow */
const plugin = require('.');

const t = utils.testPlugin(plugin);
const image = utils.getFixture('twitter.svg');

const cases = [
  {
    name: 'config: Object',
    params: { attr: 'fill', value: 'red' }
  },
  {
    name: 'config: Array<Object|Function>',
    params: [{ attr: 'fill', value: 'red' }]
  },
  {
    name: 'config: Function',
    testFunc: async () => {
      const tree = utils.parse(image);
      const transformer = jest.fn(node => node.attrs.fill = 'red');
      const res = await t(transformer, tree, { skipParse: true });

      expect(transformer).toHaveBeenCalledTimes(2);
      expect(res).toMatchSnapshot();
    }
  },
  {
    name: 'config: Array<Function>',
    params: node => node.tag === 'svg' && (node.attrs.foo = 'bar')
  },
  {
    name: 'config: throws if not Object|Array<Object|Function>|function',
    params: { attr: 'fill', value: 'red' },
    testFunc: async () => await expect(t('invalid config', image)).rejects.toThrowError()
  },
  {
    name: 'should process only selector nodes',
    params: { attr: 'fill', value: 'red', selector: 'path' }
  },
  {
    name: 'should rename tag',
    params: { selector: 'svg', tag: 'symbol' }
  }
];

for (const item of cases) {
  const testFunc = item.testFunc || (async () => {
    expect(await t(item.params, item.image || image))
      .toMatchSnapshot(item.snapshotName);
  });

  if (item.only) {
    it.only(item.name, testFunc);
  } else {
    it(item.name, testFunc);
  }
}
