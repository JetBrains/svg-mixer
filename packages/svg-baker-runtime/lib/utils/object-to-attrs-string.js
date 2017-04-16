/**
 * @param {Object} attrs
 * @return {string}
 */
export default function (attrs) {
  return Object.keys(attrs).map(attr => `${attr}="${attrs[attr]}"`).join(' ');
}
