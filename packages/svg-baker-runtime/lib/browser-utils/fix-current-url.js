import selectAttributes from './select-attributes';
import replaceURLInAttributes from './replace-url-in-attributes';
import updateReferences from './update-references';

/**
 * List of SVG attributes to fix url() target in them
 */
const attList = [
  'clipPath',
  'colorProfile',
  'src',
  'cursor',
  'fill',
  'filter',
  'marker',
  'markerStart',
  'markerMid',
  'markerEnd',
  'mask',
  'stroke',
  'style'
];

const fixSelector = attList.map(attr => `[${attr}]`).join(',');

/**
 * Fix disappeared referenced elements when <base href> differs or history.pushState occurs
 * @see http://stackoverflow.com/a/18265336/796152
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=652991
 * @see https://github.com/everdimension/angular-svg-base-fix
 * @see https://github.com/angular/angular.js/issues/8934#issuecomment-56568466
 *
 * @param {Element} svg
 * @param {NodeList} references
 * @param {string} startsWith
 * @param {string} replaceWith
 */
export default function (svg, references, startsWith, replaceWith) {
  const nodes = svg.querySelectorAll(fixSelector);
  const attrs = selectAttributes(nodes, ({ localName, nodeValue }) => {
    return attList.indexOf(localName) !== -1 && nodeValue.indexOf(`url(${startsWith}`) !== -1;
  });

  replaceURLInAttributes(attrs, startsWith, replaceWith);
  updateReferences(references, startsWith, replaceWith);
}
