import Sprite from '../sprite';
import SpriteSymbol from '../symbol';
import factory from '../sprite-factory';

const symbolData = {
  id: 'qwe',
  content: '<svg><path d=""/></svg>',
  request: 'image.svg'
};

const filename = 'sprite.svg';
let symbol;

beforeEach(() => SpriteSymbol.create(symbolData).then(s => symbol = s));

describe('static create()', () => {
  it('should work', async () => {
    const sprite = await Sprite.create({ symbols: [symbol], filename });
    sprite.should.be.instanceOf(Sprite);
    sprite.tree.should.be.an('array');
    sprite.filename.should.be.a('string');
  });

  // TODO should allow to use custom factory
});

it('constructor', async () => {
  const { tree } = await factory({ symbols: [symbol] });
  const sprite = new Sprite({ tree, filename });
  sprite.tree.should.be.an('array');
  sprite.filename.should.be.a('string');
});

it('render()', async () => {
  const sprite = await Sprite.create({ symbols: [symbol], filename });
  sprite.render().should.be.a('string');
});
