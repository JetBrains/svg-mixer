const { parser } = require('posthtml-svg-mode');
const SpriteSymbol = require('../lib/symbol');
const FileRequest = require('../lib/request');

let fixture;

describe('svg-baker/symbol', () => {
  beforeEach(() => {
    const content = '<svg><path id="qqq" d=""/></svg>';
    const rawRequest = 'image.svg';
    fixture = {
      id: 'qwe',
      content,
      tree: parser(content),
      rawRequest,
      request: new FileRequest(rawRequest)
    };
  });

  describe('static create()', () => {
    it('should resolve with symbol instance', async () => {
      const { id, content, request } = fixture;
      const s = await SpriteSymbol.create({ id, content, request });
      s.should.be.instanceof(SpriteSymbol);
    });

    it('should autogenerate id if it\'s omitted', async () => {
      const { content, request } = fixture;
      const s = await SpriteSymbol.create({ content, request });
      s.id.should.be.a('string').and.be.not.empty; // eslint-disable-line no-unused-expressions
    });

    it('should allow to pass request as a string', async () => {
      const { content, rawRequest } = fixture;
      const s = await SpriteSymbol.create({ content, request: rawRequest });
      s.request.should.be.instanceOf(FileRequest);
    });
  });

  it('constructor', () => {
    const s = new SpriteSymbol(fixture);
    const { id, request, tree, useId } = s;

    id.should.be.a('string');
    useId.should.be.a('string');
    tree.should.be.an('array');
    request.should.be.instanceOf(FileRequest);
  });

  it('get viewBox()', () => {
    const expected = '0 0 0 0';
    const inputTree = parser('<svg viewBox="0 0 0 0"></svg>');
    const { id, request } = fixture;
    new SpriteSymbol({ id, request, tree: inputTree }).viewBox.should.be.equal(expected);
  });

  it('render()', () => {
    new SpriteSymbol(fixture).render().should.be.a('string');
  });
});
