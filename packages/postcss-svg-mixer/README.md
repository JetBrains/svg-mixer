# postcss-svg-mixer

[PostCSS](https://github.com/postcss/postcss) plugin for creating SVG sprites.

## Table of contents

- [Installation](#installation)
- [Demo](#demo)
- [How it works](#how-it-works)
- [Usage](#usage)
  - [Via postcss.config.js](#via-postcss.config.js)
  - [With webpack](#with-webpack)
- [Configuration](#configuration)
  - [`spriteType`](#spriteType)
  - [`spriteFilename`](#spriteFilename)
  - [`match`](#match)
  - [`selector`](#selector)
  - [`userSprite`](#userSprite)

## Installation

```sh
npm install postcss-svg-mixer
```

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
  background-size: 100% 104.50%; /* Bg size calculated to scale image proportionally */
}
```

## How it works

- Find `background` and `background-image` declarations which contains `url()` part.
- Trying to resolve file referenced in **first** `url()` occurrence. If URL starts 
  with tilde `~` plugin will search it in node_modules (Node.js `require.resolve` mechanism is used).
  If file exists - read it's content and add to sprite, throw error otherwise.
- Modify original background image declaration for properly positioning symbol on sprite canvas, eg:
  ```css
  .img {background: url('img.svg')}

  /* becomes */
  .img {
    background: url('sprite.svg') no-repeat 0 96.15%;
    background-size: 101.83% 217.01%;
  }
  ```
- Adds a message to postcss result.messages with sprite content, filename and 
  instance with following format:
  ```
  {
    type: string = 'asset',
    kind: string = 'sprite',
    plugin: string = 'postcss-svg-mixer',
    file: string,
    sprite: Sprite | StackSprite,
    filename: string,
    content: string
  }
  ```
- When using with webpack via postcss-loader plugin emit sprite file automatically.

## Usage

```js
const { writeFileSync } = require('fs');
const postcss = require('postcss');
const mixer = require('postcss-svg-mixer');

postcss()
  .use(mixer())
  .process('.img {background: url(img.svg)}')
  .then(result => {
    const msg = result.messages.find(m => m.kind === 'sprite');
    writeFileSync(msg.filename, msg.content);
  });
```

### Via postcss.config.js

```js
const mixer = require('postcss-svg-mixer');

module.exports = {
  plugins: [
    mixer()
  ]
}
```

### With webpack

## Configuration

<a id="spriteType"></a>
### `spriteType`

Type: `string`
Default: `'classic'`

Possible values:
- `classic` (default). Images placed on canvas one after the other. Works perfect 
   in all browsers including IE10+. Generate additional styles for background image positioning.
- `stack`. [SVG stacking technique](https://css-tricks.com/svg-fragment-identifiers-work/#article-header-id-4) - 
   images placed one below the other and hidden by default. Target image becomes 
   visible via CSS `:target` selector when referencing sprite, eg. `sprite.svg#twitter`.
   **[Doesn't work in Safari](https://caniuse.com/#search=svg%20fragment)** prior to 
   11.1 macOS and 11.3 iOS. Don't generate additional styles for background image positioning.

<a id="spriteFilename"></a>
### `spriteFilename`

Type: `string`
Default: `'sprite.svg'`

Generated sprite filename which used in generated styles and in result message. 

<a id="match"></a>
### `match`

Type: `string | RegExp | Array<string | RegExp>`
Default: `/\.svg($|\?.*$)/` (any SVG file with optional query param, eg `img.svg?qwe=123`)

Filter which images should be added to sprite. Could be a string (glob pattern), 
RegExp or array of them. **Note** that rules are matched against absolute image path.
If URL starts with tilde `~` plugin will search it in node_modules (Node.js 
`require.resolve` mechanism is used).

<a id="selector"></a>
### `selector`

Type: `string`
Default: `null`

CSS selector of generated sprite styles. By default plugin transforms background
declaration of current rule, but is is possible to create separate rule with 
sprite styles by specifying valid CSS selector. Note that original background 
declaration will be moved to new rule. Example:

```js
mixer({ selector: '::after' })
```

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

<a id="userSprite"></a>
### `userSprite`

Type: [`Sprite`](https://github.com/kisenka/svg-mixer/blob/master/packages/svg-mixer/lib/sprite.js) |
[`StackSprite`](https://github.com/kisenka/svg-mixer/blob/master/packages/svg-mixer/lib/stack-sprite.js)
Default: `null`

This plugin can be used as styles generator for existing svg-mixer sprite instance.
This approach used  

```js
const { writeFileSync } = require('fs');
const createSprite = require('svg-mixer');
const postcss = require('postcss');
const postcssMixer = require('postcss-svg-mixer');

createSprite('img/*.svg').then(({ sprite, filename: spriteFilename }) => {
  /**
   * Generate CSS code like
   * .img1 {background: url(img/img1.svg)}
   * .img2 {background: url(img/img2.svg)}
   */
  const input = sprite.symbols
    .map(s => `.${s.id} {background: url(${s.image.path})`);

  return postcss()
    .use(postcssMixer({ userSprite: sprite }))
    .process(input)
    .then(({ css }) => writeFileSync('output.css', css))
    .then(() => sprite.render())
    .then(content => writeFileSync(spriteFilename, content));
});

``` 

## Using with webpack via postcss-loader

TODO
postcss-loader@2.1.4
