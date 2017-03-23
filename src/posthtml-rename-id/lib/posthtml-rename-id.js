/* eslint-disable no-cond-assign, default-case */
const escapeForRegexp = require('escape-string-regexp');

const URL_PATTERN = /url\(#([^ ]+?)\s*\)/g;

/**
 * @param {string} id
 * @param {string|Function} pattern
 */
function renameId(id, pattern) {
  const result = (typeof pattern === 'function' ? pattern(id) : pattern).toString();
  const re = new RegExp(escapeForRegexp('[id]'), 'g');
  return result.replace(re, id);
}

/**
 * @param {String|Function} [pattern='[id]']
 * @returns {Function}
 */
module.exports = function plugin(pattern = '[id]') {
  return (tree) => {
    const mappedIds = {};

    tree.match({ attrs: { id: /.*/ } }, (node) => {
      const { attrs } = node;
      const currentId = attrs.id;
      const newId = renameId(currentId, pattern);
      attrs.id = newId;

      mappedIds[currentId] = {
        id: newId,
        referenced: false,
        node
      };

      return node;
    });

    tree.match({ tag: /.*/ }, (node) => {
      const { attrs, content } = node;
      const isStyleTag = node.tag === 'style' && Array.isArray(content) && content.length === 1;

      if (isStyleTag) {
        let match;
        while ((match = URL_PATTERN.exec(content[0])) !== null) {
          const id = match[1];
          if (mappedIds[id]) {
            mappedIds[id].referenced = true;
            const re = new RegExp(escapeForRegexp(match[0]), 'g');
            content[0] = content[0].replace(re, `url(#${mappedIds[id].id})`);
          }
        }
      }

      if ('attrs' in node === false) {
        return node;
      }

      Object.keys(attrs).forEach((attrName) => {
        const value = attrs[attrName];
        let id;
        let match;

        while ((match = URL_PATTERN.exec(value)) !== null) {
          id = match[1];
          if (mappedIds[id]) {
            mappedIds[id].referenced = true;
            const re = new RegExp(escapeForRegexp(match[0]), 'g');
            attrs[attrName] = value.replace(re, `url(#${mappedIds[id].id})`);
          }
        }

        switch (attrName) {
          case 'href':
          case 'xlink:href': {
            if (value.substring(0, 1) !== '#') {
              break;
            }

            id = value.substring(1);
            const idObj = mappedIds[id];
            if (idObj) {
              idObj.referenced = false;
              attrs[attrName] = `#${idObj.id}`;
            }
            break;
          }
        }
      });

      return node;
    });
  };
};
