const postsvg = require('postsvg');
const transformPlugin = require('posthtml-transform');
const { getOptions } = require('loader-utils');
const merge = require('merge-options');

const defaultConfig = {
  raw: true,
  transform: null
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
  const transformCfg = loaderOpts.transform || this.resourceQuery.replace('?', '');

  if (!transformCfg) {
    return callback(null, content, map);
  }

  postsvg()
    .use(transformPlugin(transformCfg))
    .process(content)
    .then(res => {
      callback(null, generateResult(res.svg, loaderOpts.raw), map, {
        ast: res.tree
      });
    })
    .catch(callback);
};
