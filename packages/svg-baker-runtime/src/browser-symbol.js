import SpriteSymbol from './symbol';
import {
  parse,
  wrapInSvgString,
  moveGradientsOutsideSymbol,
  browserDetector as browser
} from './utils';

export default class BrowserSpriteSymbol extends SpriteSymbol {
  get isMounted() {
    return !!this.node;
  }

  destroy() {
    if (this.isMounted) {
      this.unmount();
    }
    super.destroy();
  }

  /**
   * @param {Element|string} target
   * @return {Element}
   */
  mount(target) {
    if (this.isMounted) {
      return this.node;
    }

    const mountTarget = typeof target === 'string' ? document.querySelector(target) : target;
    const node = this.render();
    this.node = node;

    mountTarget.appendChild(node);

    // TODO cache moved nodes somewhere and cleanup on destroy()
    if (browser.isFirefox) {
      moveGradientsOutsideSymbol(mountTarget);
    }

    return node;
  }

  /**
   * @return {Element}
   */
  render() {
    const content = this.stringify();
    return parse(wrapInSvgString(content)).childNodes[0];
  }

  unmount() {
    this.node.parentNode.removeChild(this.node);
  }
}
