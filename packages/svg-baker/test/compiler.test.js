const Compiler = require('../lib/compiler');
const SpriteSymbol = require('../lib/symbol');

describe('svg-baker/compiler', () => {
  describe('addSymbol()', () => {
    let data;

    beforeEach(() => {
      data = { path: 'image.svg', content: '<svg></svg>' };
    });

    it('should return promise resolved with Symbol', async () => {
      const result = await new Compiler().addSymbol(data);
      expect(result).to.be.instanceOf(SpriteSymbol);
    });

    it('should replace existing symbol with the same request', async () => {
      const compiler = new Compiler();

      await compiler.addSymbol(data);
      compiler.symbols[0].request.toString().should.equals(data.path);

      await compiler.addSymbol(data);
      compiler.symbols.should.be.lengthOf(1);
      compiler.symbols[0].request.toString().should.equals(data.path);
    });

    // TODO
    it('should affect each symbol added early with the same request', async () => {
    });
  });
});
