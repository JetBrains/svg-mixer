# PostSVG

A tiny wrapper over [posthtml](https://github.com/posthtml/posthtml) with the same 
API optimized for working with SVG.

## Differences from PostHTML

- Content is parsed in [xml mode](https://github.com/fb55/htmlparser2/wiki/Parser-options#option-xmlmode).
- Properly renders SVG self-closing tags (`<path />`, `<line />` etc).
- Processing result is instance of [Tree](https://github.com/kisenka/svg-mixer/blob/master/packages/postsvg/lib/tree.js) class which is wrapper 
  around Array and backward compatible with posthtml parser.

## Tree

PostSVG tree has several useful methods for work with AST:

```js
const { parse } = require('postsvg');

const tree = parse('<svg><path /><path class="qwe" /></svg>');

/**
 * `root` getter returns <svg> node
 * @return {Node}
 */ 
tree.root;

/**
 * Find all <path/> nodes
 * @return {Array<Node>}
 */
tree.select('path'); 

/**
 * Select only nodes with class="qwe"
 * @return {Array<Node>}
 */
tree.select('.qwe');

/**
 * Fill each <path/> node with red color 
 */
tree.each('path', node => node.attrs.fill = 'red');
```

Node has following structure:
```
Node<{
  tag: string,
  attrs?: Object,
  content?: Array<Node>
}>
```

## LICENSE

[MIT](https://github.com/JetBrains/svg-mixer/blob/master/LICENSE)
