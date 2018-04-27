const { dirname } = require('path');

const merge = require('merge-options');
const postcss = require('postcss');
const calipers = require('calipers');
const {
  findCssBgImageDecls,
  createMatcher,
  transformCssSelector: transformSelector,
  resolveFile,
  objectToCssDeclProps
} = require('svg-mixer-utils');

const { name: packageName } = require('./package.json');

const { measure } = calipers('png', 'jpeg', 'svg');

function getAspectRatio(imagePath) {
  return measure(imagePath).then(data => {
    const { width, height } = data.pages[0];
    return height / width;
  });
}

const UNMATCHED_FILE_ERROR_CODE = 'UNMATCHED_FILE';

const defaultConfig = {
  selector: '::before',
  match: /\.(jpe?g|png|svg)($|\?.*$)/
};

module.exports = postcss.plugin(packageName, options => {
  const { match, selector } = merge(defaultConfig, options);
  const matcher = createMatcher(match);

  return root => {
    const from = root.source.input.file;
    const contextDir = dirname(from);

    if (!from) {
      throw new Error('`from` option should be defined for proper file resolving');
    }

    const decls = findCssBgImageDecls(root);

    const promises = decls.map(({ decl, helper }) => {
      const url = helper.URIS[0].toString();
      const rule = decl.parent;

      return resolveFile(url, contextDir)
        .then(absPath =>
          (!matcher(absPath)
            ? Promise.reject({ code: UNMATCHED_FILE_ERROR_CODE })
            : absPath)
        )
        .then(getAspectRatio)
        .then(ratio => {
          const ratioFormatted = ratio % 1 !== 0
            ? parseFloat(parseFloat(ratio).toFixed(2))
            : Math.round(ratio);
          const percentage = ratioFormatted * 100;

          rule.cloneAfter({
            selector: transformSelector(rule.selector, s => `${s}${selector}`)
          })
            .removeAll()
            .append(...objectToCssDeclProps({
              display: 'block',
              'box-sizing': 'content-box',
              'padding-bottom': `${percentage}%`,
              content: '\'\''
            }));
        })
        .catch(e => {
          let error = e;
          if (e.code === UNMATCHED_FILE_ERROR_CODE) {
            return;
          } else if (e.code === 'NOT_FOUND') {
            const msg = `${url} not found`;
            error = decl.error(msg, { word: decl.prop });
          }
          // eslint-disable-next-line consistent-return
          return Promise.reject(error);
        });
    });

    return Promise.all(promises);
  };
});
