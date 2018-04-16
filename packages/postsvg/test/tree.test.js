// const {  } = require('@jetbrains/logos/appcode/appcode.svg');
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

it.only('select', () => {
  const selected = createImage().select('path');
  selected.should.be.a('array');
  expect(isNode(selected[0])).toBeTruthy();
});

it('each', () => {
  const callback = jest.fn();
  const img = createImage();
  img.each('svg', callback);
  expect(callback).toBeCalledWith(img.root, 0, img);
});
