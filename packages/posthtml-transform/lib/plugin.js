const { merge } = require('lodash');
const { match } = require('posthtml/lib/api');
const matchHelper = require('posthtml-match-helper');

const { name: packageName } = require('../package.json');

const { normalizeRules } = require('./utils');

const defaultConfig = {
  skipRootTag: false,
  convertAlphaColors: true
};

module.exports = (rules, config = {}) => {
  const cfg = merge(defaultConfig, config);

  if (typeof rules !== 'string' && !Array.isArray(rules)) {
    throw new Error(`${packageName}: rules should be \`Array<Object>|string\``);
  }

  const normalizedRules = normalizeRules(rules, cfg);

  return tree => {
    const root = tree.find(n => n.tag && Array.isArray(n.content));
    const nodes = cfg.skipRootTag ? root.content : tree;

    normalizedRules.forEach(rule => {
      // posthtml matcher, see https://github.com/posthtml/posthtml/blob/master/docs/api.md#treematchexpression-cb--function
      const matcher = !rule.selector ? { tag: /.*/ } : matchHelper(rule.selector);
      const nodesToProcess = [];

      match.call(nodes, matcher, node => {
        nodesToProcess.push(node);
        return node;
      });

      nodesToProcess.forEach(node => {
        const { attr, value, tag } = rule;

        if (tag) {
          node.tag = tag;
        }

        if (attr && value) {
          node.attrs = node.attrs || {};
          node.attrs[rule.attr] = rule.value;
        }
      });
    });

    return tree;
  };
};
