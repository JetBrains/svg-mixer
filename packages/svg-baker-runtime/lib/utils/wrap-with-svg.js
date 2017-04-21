import merge from 'deepmerge';
import objectToAttrsString from './object-to-attrs-string';

const namespaces = require('svg-baker/namespaces');

const { svg, xlink } = namespaces;

const defaultAttrs = {
  [svg.name]: svg.uri,
  [xlink.name]: xlink.uri
};

/**
 * @param {string} [content]
 * @param {Object} [attributes]
 * @return {string}
 */
export default function (content = '', attributes) {
  const attrs = merge(defaultAttrs, attributes || {});
  const attrsRendered = objectToAttrsString(attrs);
  return `<svg ${attrsRendered}>${content}</svg>`;
}
