# posthtml-transform

[PostHTML](https://github.com/posthtml/posthtml) plugin to add/modify tags attributes.

## Demo

```js
posthtml([
  transform({ attr: 'fill', value: 'red' })
]);
```

Input
```xml
<svg>
  <path />
</svg>
```

Output
```xml
<svg fill="red">
  <path fill="red" />
</svg>
```

## Install

```sh
npm install posthtml-transform
```

## Usage

```js
const { readFileSync } = require('fs');
const posthtml = require('posthtml');
const transform = require('posthtml-transform');

const input = readFileSync('input.html');

posthtml()
  .use(transform(options))
  .process(input)
  .then(({ html }) => {
    console.log(html);
  });
```

## Configuration

### Transformer as object

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

### Transformer as URL query string

It is also possible to pass URL query params string to plugin. It will be parsed and converted to transformer params, e.g:

```js
transform('fill=red'); // => { attr: 'fill', value: 'red' }
transform('fill=red&20path'); // => { attr: 'fill', value: 'red, selector: 'path' }
```

Parameter value has following syntax: `attr_name=attr_value optional_selector`.
Parameters can be combined, eg `fill=red&stroke=black`.

Examples:
```
fill=red
fill=red path
fill=red .class
fill=red #id, black .class
fill=red #id&stroke=black .class
```

## LICENSE

[MIT](https://github.com/JetBrains/svg-mixer/blob/master/LICENSE)
