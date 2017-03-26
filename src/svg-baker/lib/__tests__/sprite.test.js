import { parser } from '../../../posthtml-svg-mode';
import Sprite from '../sprite';
import SpriteSymbol from '../symbol';
import FileRequest from '../request';

const symbolData = {
  id: 'qwe',
  tree: parser('<svg><path d=""/></svg>'),
  request: new FileRequest('image.svg')
};

const filename = 'sprite.svg';
let symbol;

beforeEach(() => SpriteSymbol.create(symbolData).then(s => symbol = s));

it('static create()', async () => {
  const s = await Sprite.create({ symbols: [symbol], filename });
  s.should.be.instanceOf(Sprite);
  s.tree.should.be.an('array');
  s.filename.should.be.a('string');
});

it('constructor', () => {
  // const s = new Sprite(data);
});

