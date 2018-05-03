const postcss = require('postcss');
const { findBgDecls } = require('svg-mixer-utils/lib/postcss');

// Trying to encode sharp symbol which could be treated like fragment identifier
module.exports = postcss.plugin('postcss-encode-query-string-params', () => {
  return root => {
    const bgDecls = findBgDecls(root);

    bgDecls.forEach(({ decl, helper }) => {
      helper.URIS.forEach(url => {
        const href = url.href();
        const hasQuery = href.lastIndexOf('?') > 0;
        const query = hasQuery ? href.substring(href.lastIndexOf('?') + 1) : null;

        if (query !== null && query.length) {
          const params = query.split('&');
          const newQuery = params
            .map(paramPair => {
              let res = paramPair;
              const paramHasValue = paramPair.indexOf('=') > 0;

              if (paramHasValue) {
                const parts = paramPair.split('=');
                parts[1] = encodeURIComponent(parts[1]);
                res = parts.join('=');
              }

              return res;
            })
            .join('&');

          url.href(href.replace(query, newQuery));
        }
      });

      decl.value = helper.getModifiedRule();
    });
  };
});
