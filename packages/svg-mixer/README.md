# SVG Mixer

Library for generating and transforming SVG sprites in modern way.

## Table of contents

- [Quick example](#quick-example)
- [Installation](#installation)
- [Adapters](#adapters)
- [Configuration](#configuration)
  - [`spriteType`](#spriteType)
  - [`spriteConfig`](#spriteConfig)
  - [`generateSymbolId`](#generateSymbolId)
  - [`prettify`](#prettify)
  - [`spriteClass`](#spriteClass)
  - [`symbolClass`](#symbolClass)
- [API](#api)
- [Extending](#extending)

## Quick example

```js
const mixer = require('svg-mixer');

mixer('img/*.svg')
  .then(result => console.log(result.content));

// Write sprite content on disk
mixer(['img/**/*.svg', '!img/raw/**'])
  .then(result => result.write('sprite.svg'));

// 'Stack' sprite
mixer('img/**/*.svg', { spriteType: 'stack' })
  .then(result => result.write('sprite.svg'));

// Classic sprite with empty canvas and <defs> section with symbols
// Useful for inlining directly in HTML markup and refer to images via <use xlink:href="#symbol-id" />
mixer('img/**/*.svg', { spriteConfig: { usages: false } })
  .then(result => result.write('sprite.svg'));
```

## Installation

```bash
npm install svg-mixer
```

## Adapters

- PostCSS: [postcss-svg-mixer](https://github.com/kisenka/svg-mixer/tree/master/packages/postcss-svg-mixer).
- Gulp: [gulp-svg-mixer](https://github.com/kisenka/svg-mixer/tree/master/packages/gulp-svg-mixer).

## Configuration

<a id="spriteType"></a>
### `spriteType`

> Type: `string`<br>
> Default: `classic`

Possible values:
- `classic` (default). Images placed on canvas one after the other. Works perfect 
   in all browsers including IE10+. If sprite embedded in CSS - requires some 
   additional styles for background image positioning. [postcss-svg-mixer](https://github.com/kisenka/svg-mixer/tree/master/packages/postcss-svg-mixer) 
   can be used to generate such styles.
- `stack`. [SVG stacking technique](https://css-tricks.com/svg-fragment-identifiers-work/#article-header-id-4) - 
   images placed one below the other and hidden by default. Target image becomes 
   visible via CSS `:target` selector when referencing sprite, eg. `sprite.svg#twitter`.
   **[Doesn't work in Safari](https://caniuse.com/#search=svg%20fragment)** (both desktop and mobile) 
   prior to 11.1 macOS and 11.3 iOS. Don't requires any styles when embedding.

<a id="spriteConfig"></a>
### `spriteConfig`

> Type: `Object`

Fine tune sprite output.

- `filename` (default: `'sprite.svg'`). Sprite file name.
- `attrs` (default: `{}`). Additional sprite SVG attributes, eg. `{ class: 'my-sprite' }`.
- `usages` (default: `true`). Render images on sprite canvas or just place their symbols in
  `<defs>` section. It's useful to set `false` when sprite inlined directly to HTML 
  markup and symbols are referenced via `<use xlink:href="#symbol-id" />`. 
  Make sense only for classic sprite
- `spacing` (default: `10`). Spacing between symbols in pixels. Make sense only for classic sprite 

Stack sprite also has following options:
- `usageClassName` (default: `sprite-symbol-usage`). CSS classname of symbol to set.
  Needed to avoid possible conflicts between sprite and symbol styles.
- `styles` (default: see [stack-sprite](lib/stack-sprite.js)). CSS to archive stack technique. 
  Will be placed in `<defs>` section.

<a id="generateSymbolId"></a>
### `generateSymbolId`

> Type: `function(path: string, query: string = '') => string`

Function to generate `<symbol id>` attribute. By default file name without extension is used.
Accepts 2 arguments: absolute path to file and optional query string.

<a id="prettify"></a>
### `prettify`

> Type: `boolean`<br>
> Default: `false`

Prettify sprite output.

<a id="spriteClass"></a>
### `spriteClass`

Custom sprite implementation. See [extending](#extending) section.

<a id="symbolClass"></a>
### `symbolClass`

Custom sprite symbol implementation. See [extending](#extending) section.

## API

### Main function

Main function accepts 2 arguments: glob pattern and config.
Glob pattern could be string or array of strings. Relative/absolute path to file is also allowed:

```js
mixer('img/*.svg');
mixer(['img/*.svg', '!img/raw/*.svg']); // all from img/, but not from img/raw/
mixer(['img/*.svg', 'path/to/file', '/absolute/path/to/file']);
```

### Result

Result is an object with `content` and `filename` fields, and `write()` method:
```
Result<{
  content: string,
  filename: string,
  write(filepath: string) => Promise
}>
```

The rest API docs will be ASAP. For now check [TypeScript definitions](svgmixer.d.ts) and source :)

## Extending 

svg-mixer offers OOP-like extending mechanism - to write custom sprite or symbol 
transformation you'll need to extend a base class and override `generate` method,
which returns promise resolved with [postsvg.tree](https://github.com/kisenka/svg-mixer/tree/master/packages/postsvg#tree).

Example: add `class="my-super-class"` to each node in generated sprite.

```js
const mixer = require('svg-mixer');

class MySprite extends mixer.Sprite {
  generate() {
    // Call parent `generate` method and then transform the tree
    return super.generate().then(svg => {
      svg.each(node => node.attrs.class = 'my-super-class');
      return svg;
    });
  }
}

mixer('img/*.svg', { spriteClass: MySprite });
```

As it possible to pass query params when adding image to sprite by `addSymbolFromFile` 
compiler method, it makes possible to process single file with different params 
in various ways (like webpack does).

Example: fill one image with different colors.

```js
const mixer = require('svg-mixer');
const transform = require('posthtml-transform');

class MySymbol extends mixer.SpriteSymbol {
  generate() {
    const { query } = this.image;
    return super.generate().then(svg => transform(query)(svg));
  }
}

const compiler = new mixer.Compiler({ symbolClass: MySymbol });
compiler
  .addSymbolFromFile('img.svg')
  .then(() => compiler.addSymbolFromFile('img.svg?fill=red'))
  .then(() => compiler.compile())
  .then(result => console.log(result.content));
```

The code above will generate sprite with 2 symbols - original image and filled with red color.
In this example adding images and generating sprite performed manually, but when 
using svg-mixer [adapters](#adapters) you'll need only to pass custom implementation 
to adapter config.

## LICENSE

[MIT](https://github.com/JetBrains/svg-mixer/blob/master/LICENSE)
