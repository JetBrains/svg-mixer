import namespaces from 'svg-baker/namespaces';
import arrayFrom from '../utils/array-from';

const xLinkNS = namespaces.xlink.uri;
const xLinkAttrName = 'xlink:href';

/**
 * @param {NodeList} nodes
 * @param {string} startsWith
 * @param {string} replaceWith
 * @return {NodeList}
 */
export default function updateReferences(nodes, startsWith, replaceWith) {
  arrayFrom(nodes).forEach((node) => {
    const href = node.getAttribute(xLinkAttrName);
    if (href && href.indexOf(startsWith) === 0) {
      const newUrl = href.replace(startsWith, replaceWith);
      node.setAttributeNS(xLinkNS, xLinkAttrName, newUrl);
    }
  });

  return nodes;
}
