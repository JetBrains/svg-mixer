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

function generateResult(content, raw = defaultConfig.raw) {
  return raw ? content : `module.exports = ${JSON.stringify(content)}`;
}

// eslint-disable-next-line func-names,consistent-return
module.exports = function (content, map) {
  if (this.version === 1 && this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();
  const loaderOpts = merge(defaultConfig, getOptions(this) || {});
  const query = this.resourceQuery ? parseQuery(this.resourceQuery) : null;

  if (!query || isEmpty(query)) {
    return callback(null, generateResult(content, loaderOpts.raw), map);
  }

  if (typeof loaderOpts.transformQuery === 'function') {
    loaderOpts.transformQuery(query);
  }

  postsvg()
    .use(transformPlugin(stringifyQuery(query)))
    .process(content)
    .then(res => {
      callback(null, generateResult(res.svg, loaderOpts.raw), map, {
        ast: res.tree
      });
    })
    .catch(callback);
};
