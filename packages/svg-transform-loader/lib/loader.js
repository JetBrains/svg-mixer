const postsvg = require('postsvg');
const transformPlugin = require('posthtml-transform');
const { getOptions, parseQuery } = require('loader-utils');
const { stringify: stringifyQuery } = require('query-string');
const isEmpty = require('lodash.isempty');
const merge = require('merge-options');

const defaultConfig = {
  raw: true,
  transformQuery: null
};

function generateLoaderResult(content, raw = true) {
  return raw ? content : `module.exports = ${JSON.stringify(content)}`;
}

// eslint-disable-next-line func-names,consistent-return
module.exports = function (content, map) {
  if (this.version === 1 && this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();

  const {
    raw,
    transformQuery,
    ...transformPluginCfg
  } = merge(defaultConfig, getOptions(this) || {});

  const query = this.resourceQuery ? parseQuery(this.resourceQuery) : null;

  if (!query || isEmpty(query)) {
    return callback(null, generateLoaderResult(content, raw), map);
  }

  if (typeof transformQuery === 'function') {
    transformQuery(query);
  }

  Object.keys(query).forEach(param => {
    query[param] = decodeURIComponent(query[param]);
  });

  postsvg()
    .use(transformPlugin(stringifyQuery(query), transformPluginCfg))
    .process(content)
    .then(res => {
      callback(null, generateLoaderResult(res.svg, raw), map, {
        ast: res.tree
      });
    })
    .catch(callback);
};
