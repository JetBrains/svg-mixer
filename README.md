# SVG Mixer

Node.js toolset for generating & transforming SVG images and sprites in modern way. 

**Under heavy development. Docs in progress. Stay tuned!**

Main tools:

- [svg-mixer](packages/svg-mixer) - SVG sprites generating and transforming library.
- [postcss-svg-mixer](packages/postcss-svg-mixer) - PostCSS plugin for creating SVG sprites.
- [gulp-svg-mixer](packages/gulp-svg-mixer) - Gulp plugin for creating SVG sprites.
- [postsvg](packages/postsvg) - PostHTML wrapper optimized for working with SVG.
- [svg-transform-loader](packages/svg-transform-loader) - webpack loader for transforming SVG.

Other:

- [posthtml-transform](packages/posthtml-transform) - PostHTML plugin to modify tags and attributes.
- [posthtml-rename-id](packages/posthtml-rename-id) - PostHTML plugin to rename id attributes and it's references.
- [postcss-move-props-to-bg-image-query](packages/postcss-move-props-to-bg-image-query) - 
  PostCSS plugin for moving CSS declarations to background image as query string.

## Prerequisites

- [Yarn](https://yarnpkg.com) >= 1.
- [Node.js](https://nodejs.org) >= 8.

## Setup

Dependencies managed by Yarn workspaces, lifecycle (build, test, release) performed by [Lerna](https://github.com/lerna/lerna).
To setup the project install dependencies: 

```sh
yarn install
```

## License 

Apache 2.0
