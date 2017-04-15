const namespaces = require('svg-baker/namespaces');

class Sprite {
  constructor(symbols = []) {
    this.symbols = symbols;
  }

  add(symbol) {
    const { symbols } = this;
    const existing = this.find(symbol.id);

    if (existing) {
      return existing;
    }

    return symbols.push(symbol);
  }

  remove(id) {
    const { symbols } = this;
    const symbol = this.find(id);

    if (symbol) {
      const i = symbols.indexOf(symbol);
      symbols.splice(i, 1);
      symbol.destroy();
    }
  }

  find(id) {
    return this.symbols.find(s => s.id === id);
  }

  has(id) {
    return !!this.find(id);
  }

  toString() {
    const { svg, xlink } = namespaces;

    const attrs = {
      [svg.name]: svg.value,
      [xlink.name]: xlink.value,
      style: ['position: absolute', 'width: 0', 'height: 0'].join('; ')
    };

    const attrsRendered = Object.keys(attrs).map(attr => `${attr}="${attrs[attr]}"`).join(' ');
    const symbolsRendered = this.symbols.map(s => s.toString());

    return `<svg ${attrsRendered}>${symbolsRendered}</svg>`;
  }
}

module.exports = new Sprite();
