# postcss-aspect-ratio-from-bg-image 

[PostCSS](https://github.com/postcss/postcss) plugin to generate styles for 
maintaining block aspect ratio of referenced background image (aka [Uncle Dave's Ol' Padded Box](https://daverupert.com/2012/04/uncle-daves-ol-padded-box)).
JPG, PNG and SVG files are supported.

- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
- [Configuration](#configuration)
  - [`selector`](#selector)
  - [`match`](#match)

## Installation

```sh
npm install postcss-aspect-ratio-from-bg-image
```

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

<a id="selector"></a>
#### `selector`

Type: `string`
Default: `::before`

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

<a id="match"></a>
#### `match`

Type: `string | RegExp | Array<string | RegExp>`
Default: `/\.(jpe?g|png|svg)($|\?.*$)/`

Which `url()` imports should be processed. Could be a string (glob pattern), RegExp 
or array of them. 

**Note** that rules are matched against absolute image path.

```js
// Include all SVGs, except images from node_modules
aspectRatio({ match: [
  /\.svg$/,
  '!**/node_modules/**'
]});
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
