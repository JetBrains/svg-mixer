import { parse, wrapInSvgString, arrayFrom } from '../src/utils';

/**
 * @param {Element} node
 */
export function remove(node) {
  node.parentNode.removeChild(node);
}

/**
 * @param {string} href
 * @return {Element}
 */
export function createBaseTag(href) {
  const baseTagHref = href || window.location.href.split('#')[0];

  const baseTag = document.createElement('base');
  baseTag.setAttribute('href', baseTagHref);
  document.querySelector('head').appendChild(baseTag);

  return baseTag;
}

export function removeBaseTag() {
  const baseTag = document.querySelector('base');
  remove(baseTag);
}

/**
 * @param {string} href
 * @return {Element}
 */
export function createUse(href) {
  return parse(wrapInSvgString(`<use xlink:href="${href}"></use>`));
}

/**
 * @param {Element} node
 * @return {string[]}
 */
export function collectUrls(node) {
  const elemsWithUrl = arrayFrom(node.querySelectorAll('[fill^="url("]'));
  return elemsWithUrl.map((elem) => {
    return elem.getAttribute('fill');
  });
}

/**
 * @return {Object}
 */
export function mockAngular() {
  return {
    module() {
      return {
        run() {}
      };
    }
  };
}
