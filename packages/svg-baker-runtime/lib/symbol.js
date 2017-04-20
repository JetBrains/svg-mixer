export default class SpriteSymbol {
  constructor({ id, viewBox, content }) {
    this.id = id;
    this.viewBox = viewBox;
    this.content = content;
  }

  toString() {
    return this.content;
  }

  destroy() {
    ['id', 'viewBox', 'content'].forEach(prop => delete this[prop]);
  }
}
