# gulp-svg-mixer

[Gulp](https://github.com/gulpjs/gulp) plugin for creating SVG sprites.

## Installation

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

### `sprite.type`

> Type: `string`<br>
> Default: `classic`

See [svg-mixer.spriteType](https://github.com/kisenka/svg-mixer/tree/master/packages/svg-mixer#spriteType)
for details.

### `sprite.filename`

> Type: `string`<br>
> Default: `'sprite.svg'`

Name of generated sprite file.

### `css.filename`

> Type: `string`<br>
> Default: `'sprite-styles.css'`

Name of generated CSS file.

### `css.selector`

> Type: `string`<br>
> Default: `'.[symbol-id]'`

CSS selector for generate symbol styles. `[symbol-id]` will be replaced by 
actual symbol id.

### `css.aspectRatio`

> Type: `boolean`<br>
> Default: `true`

Generate aspect ratio CSS styles.
    
### `prettify`

> Type: `boolean`<br>
> Default: `true`

Prettify SVG and CSS output.

## Examples

```js
const gulp = require('gulp');
const mixer = require('gulp-svg-mixer');

gulp.src('img/*.svg')
  .pipe(mixer({
    sprite: { type: 'stack', filename: 'stack-sprite.svg' },
    css: { selector: '#[symbol-id]' }
  }))
  .pipe(gulp.dest('build'));
```

## LICENSE

[MIT](LICENSE)
