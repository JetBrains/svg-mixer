# svg-transform-loader

Webpack loader to add/modify tags and attributes in SVG image. Main purpose - 
fill, stroke and other manipulations with image imported from CSS/SCSS/LESS/Stylus/PostCSS.

- [Demo](#demo)
- [Installation](#installation)
- [Webpack config](#webpack-config)
- [Further SVG handling](#further-svg-handling)
- [How to pass transform parameters](#how-to-pass-transform-parameters)
- [Configuration](#configuration)
- ⚠[Important notices](#notices)
  - [Usage with css-loader](#usage-with-css-loader)
  - [Usage with resolve-url-loader](#usage-with-resolve-url-loader)
  - [Usage with file-loader](#usage-with-file-loader)

## Demo

Fill image with white color:
```css
.img {
  background-image: url('./img.svg?fill=#fff');
}
```

Stroke image by using variable in SCSS:
```scss
$stroke-color: #fff;

.img {
  background-image: url('./img.svg?stroke=#{$stroke-color}');
}
```

When used with [postcss-move-props-to-bg-image-query](https://github.com/kisenka/svg-mixer/tree/master/packages/postcss-move-props-to-bg-image-query) 
it is possible to specify transform parameters as usual CSS declarations:
```css
.img {
  background-image: url('./img.svg');
  -svg-fill: red;
  -svg-stroke: black;
}
```

## Installation

```
npm install svg-transform-loader
```

## Webpack config

**It's safe to pass all SVGs through this loader, if no transform params presented 
it just returns original source.**

Transform parameters are passed via query string, so match rule for svg files 
should consider this:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.svg(\?.*)?$/, // match img.svg and img.svg?param=value
        use: [
          'url-loader', // or file-loader or svg-url-loader
          'svg-transform-loader'
        ]
      }
    ]
  }
}
```

## Further SVG handling

Don't forget that this loader leaves any further SVG processing to your choice.
You can use:
- url-loader/svg-url-loader to inline the SVG into CSS.
- file-loader to save SVG as a file ([read the notice](#usage-with-file-loader)).

## How to pass transform parameters

Transform parameter has following syntax: `attr_name=attr_value optional_selector`.<br>
Multiple values can be specified by separating them with comma: `fill=red .path1, blue .path2`.<br>
Parameters can be combined: `fill=red&stroke=black`.

```css
.img {background-image: url('./img.svg?fill=#fff')}

/* Fill all <path/> tags */
.img {background-image: url('./img.svg?fill=#fff path')}

/* Fill all <path/> tags, stroke element with id="qwe" */
.img {background-image: url('./img.svg?fill=#fff path&stroke=black #qwe')}
```

<a id="postcss-move-props-to-bg-image-query"></a>
### Recommended: postcss-move-props-to-bg-image-query

It is possible to write parameters as usual style declarations in CSS and this 
plugin will turn them into background image query params:

```css
.img {
  background-image: url('./img.svg');
  -svg-fill: #ffffff path, blue circle;
  -svg-stroke: #ede;
}

/* turns into */
.img {
  background-image: url('./img.svg?fill=%23ffffff%20path%2C%20blue%20circle&stroke=%23ede');
}
```

For more info read [plugin docs](https://github.com/kisenka/svg-mixer/tree/master/packages/postcss-move-props-to-bg-image-query#usage).

## Configuration

### `raw`

> Type: boolean<br>
> Default: `true`

By default loader returns transformed image as-is, which is convenient for further 
processing with file-loader (e.g. to create a separate file), or 
url-loader/svg-url-loader (to inline it in CSS code). However, sometimes you 
might need to get the image as a module (like, for rendering with React). In this 
case, you'll need to set `raw: false`.

### `transformQuery`

TODO

<a id="notices"></a>
## ⚠ Important notices

### Usage with css-loader

Note that when using css-loader to handle CSS, sharp `#` symbol in image query 
params should be encoded, because css-loader will treat it as 
[fragment identifier](https://en.wikipedia.org/wiki/Fragment_identifier) part of URL:

```css
.img {background-image: url(img.svg?fill=#f0f)}

/* will be treated as */
.img {background-image: url(img.svg?fill=)}
``` 

To work around this you have several options.

- **Recommended**: use PostCSS plugin postcss-move-props-to-bg-image-query. See 
  more details in [corresponding section](#postcss-move-props-to-bg-image-query).
- Use special loader to encode sharp in CSS imports. svg-transform-loader comes 
  with special loader which can be used to encode sharp in CSS imports. This 
  loader should be defined **before** css-loader and after any other style 
  loaders (webpack call loaders from right to left). Please note that css-loader
  [`importLoaders`](https://github.com/webpack-contrib/css-loader#importloaders) 
  option should be set to `1` or higher:
  ```js
  // webpack.config.js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.svg(\?.*)?$/, 
          use: [
            'url-loader',
            'svg-transform-loader' 
          ]
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1 // This option should be set to work with encode-query loader
              }
            },
            'svg-transform-loader/encode-query', // loader should be defined BEFORE css-loader
            'sass-loader' // but AFTER any other loaders which produces CSS
          ]
        }
      ]
    }
  }
  ```
  Encode loader uses PostCSS under the hood, so if you already have it on 
  the project it's better to use [postcss-move-props-to-bg-image-query](#postcss-move-props-to-bg-image-query)
  to avoid double parsing and performance downgrade. 
- Encode sharp manually. Replace `#` with `%23` directly in import:
  ```css
  .img {background-image: url(img.svg?fill=%23f0f)}
  ``` 
- Use preprocessor mixin. If style preprocessor is used, sharp encoding can be 
  automated via mixin. Example of SCSS mixin:
  ```scss
  @mixin fill-background-image($url, $color) {
    $base-color: str-slice(inspect($color), 2);
    background-image: unquote('url("' + $url + "?fill=%23" + $base-color +'")');
  }

  /* and use it like this */
  $hex-color: #e6e6e6;

  .img {
    @include fill-background-image('img.svg', $hex-color);
  }
  ```

### Usage with resolve-url-loader

If you're using resolve-url-loader for rewriting paths in SCSS/LESS/etc, keep in 
mind that it will remove query string by default and svg-transform-loader will 
not be able to handle the image. To fix this set `keepQuery` resolve-url-loader 
option to `true`:

```js
{
  test: /\.scss$/,
  use: [
    'css-loader',
    {
      loader: 'resolve-url-loader',
      options: {
        keepQuery: true // <- this!
      }
    },
    'sass-loader'
  ]
}
```

### Usage with file-loader

Keep in mind that you should use `[hash]` token in [file-loader name option](https://github.com/webpack-contrib/file-loader#name), 
otherwise webpack will create only 1 file per SVG image.

## LICENSE

[MIT](https://github.com/JetBrains/svg-mixer/blob/master/LICENSE)
