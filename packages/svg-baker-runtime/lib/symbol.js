class SpriteSymbol {
  constructor({ id, useId, viewBox, content }) {
    this.id = id;
    this.useId = useId;
    this.viewBox = viewBox;
    this.content = content;
  }

  toString() {
    return this.content;
  }

  destroy() {
    ['id', 'useId', 'viewBox', 'content'].forEach(prop => delete this[prop]);
  }
}

module.exports = SpriteSymbol;
