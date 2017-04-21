import selectAttributes from './select-attributes';
import replaceURLInAttributes from './replace-url-in-attributes';
import updateReferences from './update-references';

/**
 * List of SVG attributes to update url() target in them
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
 * Update URLs in sprite and referencing elements
 * @param {Element} svg
 * @param {NodeList} references
 * @param {string} startsWith
 * @param {string} replaceWith
 */
export default function (svg, references, startsWith, replaceWith) {
  const nodes = svg.querySelectorAll(fixSelector);
  const attrs = selectAttributes(nodes, ({ localName, value }) => {
    return attList.indexOf(localName) !== -1 && value.indexOf(`url(${startsWith}`) !== -1;
  });

  replaceURLInAttributes(attrs, startsWith, replaceWith);
  updateReferences(references, startsWith, replaceWith);
}
