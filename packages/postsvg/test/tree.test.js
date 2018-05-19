const { readFileSync } = require('fs');

const { parse, Tree } = require('..');

const image = readFileSync(require.resolve('@jetbrains/logos/appcode/appcode.svg')).toString();

/**
 * @return {PostSvgTree}
 */
function createImage() {
  return parse(image);
}

/**
 * @param {*} node
 * @return {boolean}
 */
function isNode(node) {
  return node.hasOwnProperty('tag');
}

it('static createFromArray', () => {
  expect(Tree.createFromArray([])).toBeInstanceOf(Tree);
});

it('get root', () => {
  expect(createImage().root).toHaveProperty('tag', 'svg');
  expect(typeof createImage().toString()).toBe('string');
});

it('clone', () => {
  const img = createImage();
  const clone = img.clone();
  expect(clone).toBeInstanceOf(Tree);
  expect(img === clone).toBeFalsy();
});

describe('select', () => {
  it('should select nodes', () => {
    const nodes = createImage().select('path');
    expect(Array.isArray(nodes)).toBeTruthy();
    expect(isNode(nodes[0])).toBeTruthy();
  });

  it('should select all nodes if called without arguments', () => {
    const nodes = createImage().select();
    expect(nodes.length).toBe(20);
    expect(nodes.every(isNode)).toBeTruthy();
  });
});

describe('each', () => {
  it('should call callback on each selected node', () => {
    const callback = jest.fn();
    const img = createImage();

    img.each('svg', callback);

    // 1 <svg> tag in fixture image
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toBeCalledWith(img.root, 0, img);

    callback.mockClear();

    img.each('path', callback);
    // 8 <path> tags in fixture image
    expect(callback).toHaveBeenCalledTimes(8);
  });

  it('should invoke callback on each node if selector passed as function', () => {
    const callback = jest.fn();
    const img = createImage();

    img.each(callback);
    expect(callback).toHaveBeenCalledTimes(20);
  });
});
