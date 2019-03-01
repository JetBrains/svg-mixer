function comparator(left, right) {
  const leftId = left.id;
  const rightId = right.id;

  if (leftId === rightId) {
    return 0;
  }
  return leftId < rightId ? -1 : 1;
}

class SpriteSymbolsMap extends Map {
  /**
   * @param {Array<SpriteSymbol>} [symbols]
   */
  constructor(symbols = []) {
    super(symbols.map(s => {
      if (!s.issuers) {
        s.issuers = symbols.filter(sb => sb.id === s.id).map(sb => sb.module && sb.module.issuer);
      }
      return [s.id, s];
    }));
  }

  /**
   * @param {SpriteSymbol} symbol
   * @return {SpriteSymbolsMap}
   */
  add(symbol) {
    return this.set(symbol.id, symbol);
  }

  /**
   * @return {Array<SpriteSymbol>}
   */
  toArray() {
    return Array.from(this.values()).sort(comparator);
  }
}

module.exports = SpriteSymbolsMap;
