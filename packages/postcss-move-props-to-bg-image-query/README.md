# postcss-move-props-to-bg-image-query

[PostCSS](https://github.com/postcss/postcss) plugin to turn some style 
declarations into background image query params. Main purpose - pass parameters 
from CSS to webpack loaders (eg. [svg-transform-loader](https://github.com/kisenka/svg-mixer/tree/master/packages/svg-transform-loader)).

- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)

## Demo

Input
```css
.img {
  background: url(img.svg); 
  -svg-mixer-fill: red;
  -svg-mixer-stroke: #000;
}
```

Output
```css
.img {
  background: url(img.svg?fill=red&stroke=%23000);
}
```

## Installation

```sh
npm install postcss-move-props-to-bg-image-query
```

## Usage

```js
const { readFileSync } = require('fs');
const postcss = require('postcss');
const moveProps = require('postcss-move-props-to-bg-image-query');

const input = readFileSync('input.css');

postcss()
  .use(moveProps())
  .process(input)
  .then(result => {
    console.log(result.css);
  });
```

Via postcss.config.js

```js
const moveProps = require('postcss-move-props-to-bg-image-query');

module.exports = {
  plugins: [
    moveProps()
  ]
}
```

## Configuration

### `match`

> Type: `string | RegExp | Array<string | RegExp>`<br>
> Default: `'-svg-mixer-*'`

Filter which declarations should be transformed. Could be a string (glob pattern), 
RegExp or array of them.

### `computeCustomProps`

> Type: [`PostCSS plugin instance`](https://api.postcss.org/global.html#pluginFunction)<br>

You can use CSS custom properties (eg. `-svg-mixer-fill: var(--color);`) in values by providing corresponding PostCSS plugin,
[postcss-custom-properties](https://github.com/postcss/postcss-custom-properties) for example:

```js
const moveProps = require('postcss-move-props-to-bg-image-query');
const customProps = require('postcss-custom-properties');

module.exports = {
  plugins: [
    moveProps({
      computeCustomProps: customProps({ preserve: false })
    })
  ]
}
```

### `transform`

> Type: `function(decl: {name: string, value: string}): {name: string, value: string}`<br>

Declaration-to-query param transform function. Accepts an object with `name` and 
`value` fields and should return object with the same structure. By default strips 
`-svg-mixer-` in declaration name, eg. `-svg-mixer-fill: red` turns into `?fill=red`. Declaration 
value will be URL encoded.

## LICENSE

[MIT](https://github.com/JetBrains/svg-mixer/blob/master/LICENSE)
