const { parse } = require('postcss');

const {
  postcss,
  resolveFile,
  ResolveError
} = require('svg-mixer-utils');

const { findBgDecls } = postcss;

describe('findBgImageDecls', () => {
  const t = (input, expectedCount) => {
    const res = findBgDecls(parse(input));
    if (expectedCount) {
      expect(res).toHaveLength(expectedCount);
    }
    return res;
  };

  it('should work!', () => {
    t('.a {color: red; background: red}', 0);
    t('.a {color: red; background-image: red}', 0);
    t('.a {color: red; background: url(qwe)}', 1);
    t('.a {color: red; background-image: url(qwe)}', 1);
    t('.a {color: red; background: url(qwe); background: red; background-image: url(qwe);}', 2);
  });
});

describe('resolveFile', () => {
  it('should work!', async () => {
    await expect(resolveFile('index.test.js', __dirname)).resolves.toBeString();
    await expect(resolveFile('index.test.js?qwe', __dirname)).resolves.toBeString();
    await expect(resolveFile('./index.test.js', __dirname)).resolves.toBeString();
    await expect(resolveFile('./index.test.js?qwe', __dirname)).resolves.toBeString();
    await expect(resolveFile('~postcss')).resolves.toBeString();
    await expect(resolveFile('qwe')).rejects.toBeInstanceOf(ResolveError);
    await expect(resolveFile('~qwe')).rejects.toBeInstanceOf(ResolveError);
  });
});
