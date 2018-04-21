# SVG Mixer for Gulp

## Install

```sh
npm install gulp-svg-mixer
```

## Usage

```js
const gulp = require('gulp');
const mixer = require('gulp-svg-mixer');

gulp.src('img/*.svg')
  .pipe(mixer())
  .pipe(gulp.dest('build'));
```

## Configuration

**Sprite**
- `sprite.type`: `'classic' | 'stack'` (default `classic`).
- `sprite.filename`: `string` (default `sprite.svg`).

**CSS**
- `css.mode`: `'plain' | 'full'` (default `plain`).
- `css.filename`: `string` (default `sprite-styles.css`).
- `css.selector`: `string` (default `.img-[symbol-id]`). `[symbol-id]` will be replaced
  by actual sprite symbol name, e.g. image `img/twitter.svg` becomes `twitter`.

**Misc**
- `prettify`: `boolean` (default `true`). Prettify output. 

## Examples

```js
const gulp = require('gulp');
const mixer = require('gulp-svg-mixer');

gulp.src('img/*.svg')
  .pipe(mixer({
    sprite: { type: 'stack', filename: 'stack-sprite.svg' },
    css: { mode: 'full', selector: '#[symbol-id]' }
  }))
  .pipe(gulp.dest('build'));
```
