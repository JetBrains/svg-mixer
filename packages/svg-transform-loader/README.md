# SVG fill loader for Webpack [![Build Status](https://travis-ci.org/kisenka/svg-fill-loader.svg?branch=master)](https://travis-ci.org/kisenka/svg-fill-loader) [![Coverage Status](https://coveralls.io/repos/github/kisenka/svg-fill-loader/badge.svg?branch=master)](https://coveralls.io/github/kisenka/svg-fill-loader?branch=master)

Webpack loader that changes colors in SVG images.
Useful when you embed SVG in CSS as background image and don't want to produce
tons of identical files which only differ in their `fill` attributes.

<a href="https://raw.githubusercontent.com/kisenka/svg-fill-loader/master/preview.gif">
  <img src="https://raw.githubusercontent.com/kisenka/svg-fill-loader/master/preview.gif" width="640">
</a>

Allow to do something like this in CSS:
```css
.icon {
  background-image: url('./image.svg?fill=#fff');
}
```

And something like this in SCSS/LESS/Stylus/etc:
```scss
// _config.scss
$icon-color: #fff;

// styles.scss
@import "_config.scss";
.icon {
  background-image: url('./image.svg?fill=#{$icon-color}');
}
```

Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
  - [`fill`](#fill-required)
  - [`raw`](#raw-optional-true-by-default)
  - [`selector`](#selector-optional)
  - [`renderOptions`](#renderoptions-optional)
- [Important notes](#important-notes)
 - [Using with css-loader](#using-with-css-loader)
 - [Using with resolve-url-loader](#using-with-resolve-url-loader)
 - [Further SVG handling](#further-svg-handling)

## Installation

```
npm install svg-fill-loader --save
```

## Configuration

Loader has two settings levels:

1. Webpack config.
2. SVG file import statement (`background-image: url('./image.svg')`).

Any option defined in webpack config level, can be overridden in file level.

### `fill` (required)

Color to repaint with. Specified in the SVG import statement as a required attribute.

```css
.image {
  background-image: url('./image.svg?fill=red');
}
```

This will result in that each of the repainted tags will receive the `fill="red"` attribute;
in case you need other attributes, like `stroke` - feel free to submit an issue about that.

### `raw` (optional, true by default)

By default the loader returns the repainted SVG as-is, which is convenient for further processing with
file-loader (e.g. to create a separate file), or url-loader/svg-url-loader (to embed it in CSS code).
However, sometimes you might need to get the image as a module (like, for rendering with React).
In this case, you'll need to set `raw=false`:

```js
{
  test: /\.svg/,
  loader: 'svg-fill-loader?raw=false'
}
```

This can also be done via import statement, but try avoiding this way:

```js
import icon from './icon.svg?fill=red&raw=false';
```

### `selector` (optional)

CSS selector for nodes to be repainted. Very simple CSS selectors are supported: 
- tag selector: `path`.
- id selector: `#id`.
- class selector: `.class`.
- selectors can be combined via comma: `circle, .path, #id`.

All presentation SVG tags are used as default selector. You can find them in [lib/posthtmlPlugin.js](https://github.com/kisenka/svg-fill-loader/blob/master/lib/posthtmlPlugin.js#L50).

#### Webpack 1.x config example:

**It's safe to pass all SVGs through loader, if no fill param presented it just returns original source.**

```js
module.exports = {
  module: {
    loaders: [
      {
        test: /\.svg((\?.*)?|$)/,
        loaders: [
          'svg-url-loader', // or url-loader
          'svg-fill-loader?selector=path,circle' // `selector` option will be used for all images processed by loader
        ]
      }
    ]
  }
}
```

#### Webpack 2.x config example:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          'svg-url-loader', // or url-loader
          {
            loader: 'svg-fill-loader',
            options: {
              selector: 'path,circle' // `selector` option will be used for all images processed by loader                 
            }
          } 
        ]
      }
    ]
  }
}
```

### `renderOptions` (optional)

Overwrites [render options](https://github.com/kisenka/svg-fill-loader/blob/master/lib/process.js#L17) - how SVG file will be rendered.


## Important notes

### Using with css-loader

If you're using css-loader to handle CSS, keep in mind that it will [cut away symbols after `#`](https://github.com/webpack-contrib/css-loader/blob/5651d70c0cb2ae6d6ce7a62bb9c7345cb018d600/lib/loader.js#L79)
when handling imports via `url(...)`, which means that the expression `url(image.svg?fill=#f00)` will be treated as `url(image.svg?fill=)`,
and the loader will not be able to handle the file. As a workaround, you can use `%23` instead of sharp (ffffuuuu),
or use the `encodeSharp` loader that is shipped with svg-fill-loader (yey!).
Mind the order in which loaders are used:

#### Webpack 1.x

```js
module.exports = {
  module: {
    loaders: [
      {
        test: /\.svg((\?.*)?|$)/,
        loader: [
          'url',
          'svg-fill'
        ]
      },
      {
        test: /\.sass$/,
        loaders: [
          'css',
          'svg-fill/encodeSharp', // <- encodeSharp loader should be defined BEFORE css-loader
          'sass' // but after any other loaders which produces CSS
        ]
      }
    ]
  }
}
```

#### Webpack 2.x

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/, 
        use: [
          'url-loader',
          'svg-fill-loader' 
        ]
      },
      {
        test: /\.sass$/,
        use: [
          'css-loader',
          'svg-fill-loader/encodeSharp', // <- encodeSharp loader should be defined BEFORE css-loader
          'sass-loader' // but after any other loaders which produces CSS
        ]
      }
    ]
  }
}
```

#### Alternative approach using mixin
You can also use mixin for this instead of webpack configuration:
```scss
@mixin apply-background-image($url, $color) {
   $base-color: str-slice(inspect($color), 2);
   background-image: unquote('url("' + $url + "?fill=%23" + $base-color +'")');
 }
```
And use it like this:
```scss
$hex-color: #e6e6e6;
.your-class {
  ...
  @include apply-background-image("../your/image.svg", $hex-color);
  ...
}
```

### Using with resolve-url-loader

If you're using resolve-url-loader for rewriting paths in SCSS/LESS/etc, keep in mind that it will remove query string by default for some reason 
and fill-loader will not be able to handle `fill=` param. To fix this set `keepQuery` option in resolve-loader:

```js
{
  test: /\.scss$/,
  loaders: [
    'css-loader',
    'resolve-url-loader?keepQuery', // <- this!
    'svg-fill-loader/encodeSharp', // encode sharp symbol FTW!
    'sass-loader'
  ]
}
```

### Further SVG handling

Don't forget that this loader leaves any further SVG processing to your choice.

You can use:
* url-loader/svg-url-loader to inline the SVG into CSS.
* file-loader to save SVG as a file.
* gtfo-loader to ooops.
