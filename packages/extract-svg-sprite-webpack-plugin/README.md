# extract-svg-sprite-webpack-plugin

Webpack plugin extract SVGs to separate file. Main purpose - extract images from CSS.
But also works with SVGs imported from JS.

- [Demo](#demo)
- [Installation](#installation)
- [Example config](#example-config)
- [Configuration](#configuration)

## Demo

Input
```css
.img {
  background: url('img.svg');
}
```

Output
```css
.img {
  background: url('sprite.svg') no-repeat 0 0;
  background-size: 100% 104.50%;
}
```

## Installation

```
npm install extract-svg-sprite-webpack-plugin
```

<a name="example-config"></a>
## Example config

For "classic" SVG sprite you will need to setup 2 loaders: first for the SVGs, 
second for CSS, for generating proper styles for positioning symbol within the sprite. 

```js
const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/,
        loader: SpritePlugin.loader
      },      
      {
        test: /\.css$/,
        use: [
          'css-loader',
          SpritePlugin.cssLoader, /* should be right BEFORE css-loader */
          'postcss-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new SpritePlugin({ options })
  ]
}
```

## Configuration

### `emit`

> Type: boolean<br>
> Default: `true`

Emit sprite file. 

### `filename`

> Type: string | Function<br>
> Default: `sprite.svg`

File name of resulting sprite. `[contenthash]` token will be replaced with hash of
file content. 

### `publicPath`

> Type: string
> Default: null

Custom public path for sprites. By default webpack's `output.publicPath` will be used.

### `runtimeGenerator`

> Type: RuntimeGenerator

Custom runtime generator. Docs will be ASAP.

### `selector`

CSS selector for generated sprite styles. By default current selector is used, 
but is is possible to create separate style rule with sprite styles by specifying 
a valid CSS selector which will be appended to current rule. Note that original 
background image declaration will be moved to new rule. Example for `selector: '::after''`:

```css
/* Input */
.img {
  background: url('img.svg');
}

/* Output */
.img {}
.img::after {
  background: url('sprite.svg') no-repeat 0 0;
  background-size: 100% 104.50%;
}
```

### `spriteClass`

> Type: mixer.Sprite
> Default: mixer.Sprite

Custom sprite class. Docs will be ASAP.

### `spriteConfig`

> Type: Object
> Default: undefined

See [svg-mixer spriteConfig](https://github.com/JetBrains/svg-mixer/tree/master/packages/svg-mixer#spriteConfig).

### `spriteType`

> Type: 'classic' | 'stack'
> Default: 'classic'

See [svg-mixer spriteType](https://github.com/JetBrains/svg-mixer/tree/master/packages/svg-mixer#spriteType).

For classic sprite you will need to setup additional loader for CSS. See [example config](#example-config).

### `symbolClass`

> Type: mixer.SpriteSymbol
> Default: mixer.SpriteSymbol

Custom symbol class. Docs will be ASAP.

### `symbolId`

> Type: string | Function
> Default: '[name]'

How `<symbol id>` attribute should be named. All patterns from [loader-utils#interpolateName](https://github.com/webpack/loader-utils#interpolatename)
are supported. Also can be a function which accepts 2 args - file path and query 
string and should return a function.

## LICENSE

[MIT](https://github.com/JetBrains/svg-mixer/blob/master/LICENSE)
