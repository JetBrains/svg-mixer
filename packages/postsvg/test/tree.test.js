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
  Tree.createFromArray([]).should.be.instanceOf(Tree);
});

it('get root', () => {
  createImage().root.should.have.property('tag').and.eql('svg');
  createImage().toString().should.be.a('string');
});

it('clone', () => {
  const img = createImage();
  img.clone().should.be.instanceOf(Tree).and.not.equal(img);
});

describe('select', () => {
  it('should select nodes', () => {
    const nodes = createImage().select('path');
    nodes.should.be.a('array');
    expect(isNode(nodes[0])).toBeTruthy();
  });

  it('should select all nodes if called without arguments', () => {
    const nodes = createImage().select();
    expect(nodes.length).toEqual(20);
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
