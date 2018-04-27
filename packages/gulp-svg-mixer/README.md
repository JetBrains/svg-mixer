# SVG Mixer for Gulp

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

Type: `string`
Default: `classic`

See [svg-mixer.spriteType](https://github.com/kisenka/svg-mixer/tree/master/packages/svg-mixer#spriteType)
for details.

### `sprite.filename`

Name of generated sprite file.

### `css.filename`

Type: `string`
Default: `'sprite-styles.css'`

Name of generated CSS file.

### `css.selector`

Type: `string`
Default: `'.[symbol-id]'`

CSS selector for sprite image.

### `css.aspectRatio`

Type: `boolean`
Default: `true`

Generate aspect ratio styles.
    
### `prettify`

Type: `boolean`
Default: `true`

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
