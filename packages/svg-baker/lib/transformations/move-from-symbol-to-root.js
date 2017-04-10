const traverse = require('traverse');
const clone = require('clone');

// Fixes Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=353575
const defaultConfig = {
  tags: ['linearGradient', 'radialGradient', 'pattern']
};

function moveFromSymbolToRoot(config = null) {
  const cfg = Object.assign({}, defaultConfig, config);

  return (tree) => {
    traverse(tree).forEach(function (node) {
      if (!this.isLeaf && node.tag && node.tag === 'symbol') {
        const parent = this.parent.node;

        traverse(node.content).forEach(function (n) {
          if (!this.isLeaf && n.tag && cfg.tags.indexOf(n.tag) !== -1) {
            const cloned = clone(this.node);
            parent.push(cloned);
            this.remove();
          }
        });
      }
    });

    return tree;
  };
}

module.exports = moveFromSymbolToRoot;
