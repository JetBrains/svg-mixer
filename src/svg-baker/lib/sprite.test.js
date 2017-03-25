import Sprite from './sprite';
import SpriteSymbol from './symbol';
import FileRequest from './request';

const symbolData = {
  id: 'qwe',
  tree: [{ tag: 'svg' }],
  content: '<svg></svg>',
  request: new FileRequest('image.svg')
};

const filename = 'sprite.svg';
let symbol;

beforeEach(() => SpriteSymbol.create(symbolData).then(s => symbol = s));

it('static create()', async () => {
  const s = await Sprite.create({ symbols: [symbol], filename });
  s.should.be.instanceOf(Sprite);
});
