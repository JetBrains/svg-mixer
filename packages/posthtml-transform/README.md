# PostHTML Transform plugin

Plugin to modify HTML/SVG tags and attributes. For instance you can find all paths in SVG and fill them by red color.

## Install

```sh
npm install posthtml-transform
```

## Usage

```js
const posthtml = require('posthtml');
const transform = require('posthtml-transform');

posthtml()
  .use(transform({ attr: 'fill', value: 'red' }))
  .process('<svg><path /></svg>')
  .then(({ html }) => {
    console.log(html); // <svg fill="red"><path fill="red" /></svg>
  });
```

## Configuration

Plugin accepts one or array of transformers. Transformer is an object with following fields:

- `attr` - name of tag attribute to modify. If doesn't exists it will be created. Should be used in combination with `value`.
- `value` - attribute value to set. Should be used in combination with `attr`.
- `tag` - tag name to set. Should be used in combination with `selector` (or without, if you want to rename all tags :).
- `selector` (optional, `*` by default) - CSS selector to find nodes. If not presented all nodes will be selected. 
  Complete list of supported selectors see on [posthtml-match-helper documentation](https://github.com/rasmusfl0e/posthtml-match-helper). 
  Here is a short list:
  - Tags `div`.
  - Ids `#id`.
  - Classes `.class`, `.class1.class2`.
  - Attributes `[attr=value]`, `[attr!=value]` etc.
  - Multiple selectors `path, .class, #id`.
  Nested selectors (`g path`, `g > path`) are **not supported**.

Example
```js
transform({ attr: 'fill', value: 'red' }); // add fill="red" to all nodes
transform({ attr: 'fill', value: 'red', selector: 'path' }); // add fill="red" only to paths
transform({ attr: 'stroke', value: 'black', selector: '#logo' }); // add `stroke` attr to node with id="logo"
transform({ selector: 'g', tag: 'symbol' }); // rename all <g> to <symbol>
```

Transformer also can be a function which will be invoked on each node. In this case you should handle modification by yourself:

```js
// clear all <g> tags
transform(node => {
  if (node.tag === 'g') {
    node.content = [];
  }
});
``` 

`node` is an object with following structure:
```
Node<{
  tag: string,
  attrs?: Object,
  content?: Array<Node>
}>
```
