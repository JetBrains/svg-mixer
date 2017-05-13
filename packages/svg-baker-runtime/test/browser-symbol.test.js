import SpriteSymbol from '../src/browser-symbol';

/**
 * @type {Array}
 */
const symbolsFixtures = require('./fixtures/data.json');

const symbolFixture = symbolsFixtures[0];

describe('svg-baker-runtime/browser-symbol', () => {
  let symbol;

  afterEach(() => {
    try {
      symbol.destroy();
    } catch (e) {
      // nothing
    }
  });

  describe('get isMounted()', () => {
    it('should return `true` if symbol node exists, `false` otherwise', () => {
      symbol = new SpriteSymbol(symbolFixture);
      symbol.isMounted.should.be.false;
      symbol.mount(document.body);
      symbol.isMounted.should.be.true;
    });
  });

  describe('mount()', () => {
    it('should mounts only once', () => {
      const body = document.querySelector('body');

      symbol = new SpriteSymbol(symbolFixture);
      symbol.mount(body);

      body.querySelectorAll('symbol').length.should.be.equal(1);

      symbol.mount();
      symbol.mount();

      body.querySelectorAll('symbol').length.should.be.equal(1);
    });
  });

  describe('render()', () => {
    it('should return HTML element', () => {
      symbol = new SpriteSymbol(symbolFixture);
      symbol.render().should.be.instanceOf(Element);
    });
  });
});
