module.exports = function normalizeViewBox() {
  return tree => {
    const root = tree.root;
    root.attrs = root.attrs || {};
    const attrs = root.attrs;
    const { width, height, viewBox } = attrs;

    if (!viewBox && width && height) {
      attrs.viewBox = `0 0 ${width} ${height}`;
    }

    return tree;
  };
};
