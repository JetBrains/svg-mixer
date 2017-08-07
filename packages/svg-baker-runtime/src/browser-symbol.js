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

    // :WORKAROUND:
    // IE doesn't evaluate <style> tags in SVGs that are dynamically added to the page.
    // This trick will trigger IE to read and use any existing SVG <style> tags.
    //
    // Reference: https://github.com/iconic/SVGInjector/issues/23
    if (browser.isIE || browser.isEdge) {
      const styles = document.querySelectorAll('style');
      for (let i = 0, l = styles.length; i < l; i += 1) {
        styles[i].textContent += '';
      }
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
