# postcss-aspect-ratio-from-bg-image 

[PostCSS](https://github.com/postcss/postcss) plugin to generate styles for 
maintaining block aspect ratio of referenced background image (aka [Uncle Dave's Ol' Padded Box](https://daverupert.com/2012/04/uncle-daves-ol-padded-box)).
JPG, PNG and SVG files are supported.

- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [`selector`](#selector)
  - [`match`](#match)

## Demo

Input
```css
.a {
  background: url(img.svg)
}
```

Output
```css
.a {
  background: url(img.svg)
}

.a::before {
  display: block;
  box-sizing: content-box;
  padding-bottom: 81%;
  content: ''
}
```

## Installation

```sh
npm install postcss-aspect-ratio-from-bg-image
```

## Usage

```js
const postcss = require('postcss');
const aspectRatio = require('postcss-aspect-ratio-from-bg-image');

postcss()
  .use(aspectRatio())
  .process(input, { from: '/path/to/input.css' })
  .then(result => {
    console.log(result.css);
  })
```

Via postcss.config.js

```js
const aspectRatio = require('postcss-aspect-ratio-from-bg-image');

module.exports = {
  plugins: [
    aspectRatio()
  ]
}
```

## Configuration

#### `selector`

> Type: `string`<br>
> Default: `::before`

CSS selector of generated rule. For instance with `selector: '.ratio'` output 
will looks like:

```css
/* original rule */
.a {
  background: url(img.svg)
}

/* generated rule */
.a.ratio {
  display: block;
  box-sizing: content-box;
  padding-bottom: 81%;
  content: ''
}
```

#### `match`

> Type: `string | RegExp | Array<string | RegExp>`<br>
> Default: `/\.(jpe?g|png|svg)(\?.*)?$/`  (any jpg/png/svg file with optional query param, eg `img.png?qwe=123`)

Which `url()` imports should be processed. Could be a string (glob pattern), RegExp 
or array of them. Rules are tested against absolute image path.

```js
// Include all SVGs, except images from node_modules
aspectRatio({
  match: [/\.svg$/, '!**/node_modules/**']
});
```

By default all png, jpg and svg files are affected. If you want to process specific
file you can specify query param in import:

```css
.a {background: url(img.svg?ratio)}
```

and create corresponding rule to match only imports with `?ratio` param:
```js
// 
aspectRatio({ match: /\.svg\?ratio$/ });
```

## LICENSE

[MIT](https://github.com/JetBrains/svg-mixer/blob/master/LICENSE)
