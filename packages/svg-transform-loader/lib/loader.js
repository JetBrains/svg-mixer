const postsvg = require('postsvg');
const transformPlugin = require('posthtml-transform');
const { getOptions, parseQuery } = require('loader-utils');
const { stringify: stringifyQuery } = require('query-string');
const isEmpty = require('lodash.isempty');
const merge = require('merge-options');

const defaultConfig = {
  raw: true,
  transformQuery: null,
  convertAlphaColors: false
};

/**
 * @param {string} value
 * @return {{space: string, alpha: number, values: number[]}|null}
 */
function parseColor(value) {
  const parsed = require('color-parse')(value);
  return parsed.space && !isEmpty(parsed.values) ? parsed : null;
}

function convertAlphaColors(query) {
  const fillParsed = query.fill ? parseColor(query.fill) : null;
  const strokeParsed = query.stroke ? parseColor(query.stroke) : null;

  if (fillParsed && fillParsed.alpha < 1) {
    query.fill = `${fillParsed.space}(${fillParsed.values.join(', ')})`;
    query['fill-opacity'] = fillParsed.alpha.toString();
  }

  if (strokeParsed && strokeParsed.alpha < 1) {
    query.stroke = `${strokeParsed.space}(${strokeParsed.values.join(', ')})`;
    query['stroke-opacity'] = strokeParsed.alpha.toString();
  }
}

function generateResult(content, raw = defaultConfig.raw) {
  return raw ? content : `module.exports = ${JSON.stringify(content)}`;
}

// eslint-disable-next-line func-names,consistent-return
module.exports = function (content, map) {
  if (this.version === 1 && this.cacheable) {
    this.cacheable();
  }

  const callback = this.async();
  const opts = merge(defaultConfig, getOptions(this) || {});
  const query = this.resourceQuery ? parseQuery(this.resourceQuery) : null;

  if (!query || isEmpty(query)) {
    return callback(null, generateResult(content, opts.raw), map);
  }

  if (typeof opts.transformQuery === 'function') {
    opts.transformQuery(query);
  }

  if (opts.convertAlphaColors && (query.fill || query.stroke)) {
    const color = parseColor();
  }

  postsvg()
    .use(transformPlugin(stringifyQuery(query)))
    .process(content)
    .then(res => {
      callback(null, generateResult(res.svg, opts.raw), map, {
        ast: res.tree
      });
    })
    .catch(callback);
};
