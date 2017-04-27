import SpriteSymbol from './symbol';
import parse from './utils/parse';

export default class BrowserSpriteSymbol extends SpriteSymbol {
  /**
   * @return {Element}
   */
  render() {
    return parse(this.stringify());
  }
}
