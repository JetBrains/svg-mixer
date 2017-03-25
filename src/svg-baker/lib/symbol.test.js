import SpriteSymbol from './symbol';
import FileRequest from './request';

let data;

beforeEach(() => {
  data = {
    id: 'qwe',
    tree: [],
    request: new FileRequest('image.svg')
  };
});

it('static create()', async () => {
  data.content = '<svg></svg>';
  delete data.tree;

  const s = await SpriteSymbol.create(data);
  const { id, request, tree } = s;

  s.should.be.instanceof(SpriteSymbol);
  id.should.be.a('string');
  tree.should.be.an('array');
  request.should.be.instanceOf(FileRequest);
});

it('constructor', () => {
  const s = new SpriteSymbol(data);
  const { id, request, tree, usageId } = s;

  id.should.be.a('string');
  usageId.should.be.a('string');
  tree.should.be.an('array');
  request.should.be.instanceOf(FileRequest);
});

it('get viewBox()', () => {
  const expected = '0 0 0 0';
  data.tree = [{ tag: 'svg', attrs: { viewBox: expected } }];
  new SpriteSymbol(data).viewBox.should.be.equal(expected);
});

it('render()', () => {
  new SpriteSymbol(data).render().should.be.a('string');
});
